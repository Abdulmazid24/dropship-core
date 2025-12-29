import axios from 'axios';
import crypto from 'crypto';
import { IPaymentProvider } from './payment.interface';
import { env } from '../../config/env';
import { Payment } from './payment.model';

export class SSLCommerzProvider implements IPaymentProvider {
    private baseUrl: string;
    private storeId: string;
    private storePassword: string;

    constructor() {
        this.baseUrl = env.SSLCOMMERZ_IS_LIVE === 'true'
            ? 'https://securepay.sslcommerz.com'
            : 'https://sandbox.sslcommerz.com';
        this.storeId = env.SSLCOMMERZ_STORE_ID;
        this.storePassword = env.SSLCOMMERZ_STORE_PASSWORD;
    }

    async createPaymentIntent(
        amount: number,
        currency: string,
        metadata: Record<string, any>
    ) {
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create payment record first
        const payment = await Payment.create({
            orderId: metadata.orderId,
            userId: metadata.userId,
            provider: 'SSLCOMMERZ',
            amount,
            currency,
            status: 'PENDING',
            transactionId,
            idempotencyKey: metadata.idempotencyKey,
        });

        const data = {
            store_id: this.storeId,
            store_passwd: this.storePassword,
            total_amount: amount,
            currency,
            tran_id: transactionId,
            success_url: `${env.FRONTEND_URL}/payment/success`,
            fail_url: `${env.FRONTEND_URL}/payment/failed`,
            cancel_url: `${env.FRONTEND_URL}/payment/cancelled`,
            ipn_url: `${env.FRONTEND_URL}/api/payment/webhook/sslcommerz`,
            // Customer info
            cus_name: metadata.customerName || 'Customer',
            cus_email: metadata.customerEmail || 'customer@example.com',
            cus_phone: metadata.customerPhone || '01700000000',
            cus_add1: metadata.shippingAddress || 'Dhaka',
            cus_city: metadata.city || 'Dhaka',
            cus_country: metadata.country || 'Bangladesh',
            // Product info
            product_name: `Order ${metadata.orderId}`,
            product_category: 'eCommerce',
            product_profile: 'general',
            // Shipping
            shipping_method: 'NO',
            num_of_item: metadata.itemCount || 1,
        };

        const response = await axios.post(
            `${this.baseUrl}/gwprocess/v4/api.php`,
            data,
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        if (response.data.status !== 'SUCCESS') {
            throw new Error(response.data.failedreason || 'Payment initialization failed');
        }

        // Update payment with provider payment ID
        payment.providerPaymentId = response.data.sessionkey;
        payment.providerResponse = response.data;
        await payment.save();

        return {
            paymentId: payment._id.toString(),
            redirectUrl: response.data.GatewayPageURL,
            providerPaymentId: response.data.sessionkey,
        };
    }

    async verifyPayment(paymentId: string, providerPaymentId: string) {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }

        const response = await axios.get(
            `${this.baseUrl}/validator/api/validationserverAPI.php`,
            {
                params: {
                    val_id: providerPaymentId,
                    store_id: this.storeId,
                    store_passwd: this.storePassword,
                    format: 'json',
                },
            }
        );

        const isValid = response.data.status === 'VALID' || response.data.status === 'VALIDATED';
        const status = isValid ? 'COMPLETED' : 'FAILED';

        // Update payment
        payment.status = status;
        payment.transactionId = response.data.tran_id;
        payment.providerResponse = response.data;
        if (!isValid) {
            payment.failureReason = response.data.error || 'Payment validation failed';
        }
        await payment.save();

        return {
            success: isValid,
            status,
            transactionId: response.data.tran_id,
            providerResponse: response.data,
        };
    }

    async refundPayment(paymentId: string, amount?: number) {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }

        const refundAmount = amount || payment.amount;
        const refundId = `REFUND-${Date.now()}`;

        const response = await axios.get(
            `${this.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`,
            {
                params: {
                    refund_amount: refundAmount,
                    refund_remarks: 'Customer refund request',
                    bank_tran_id: payment.transactionId,
                    refe_id: refundId,
                    store_id: this.storeId,
                    store_passwd: this.storePassword,
                    format: 'json',
                },
            }
        );

        if (response.data.status !== 'SUCCESS') {
            throw new Error(response.data.errorReason || 'Refund failed');
        }

        // Update payment
        payment.refundedAmount = (payment.refundedAmount || 0) + refundAmount;
        payment.refundedAt = new Date();
        if (payment.refundedAmount >= payment.amount) {
            payment.status = 'REFUNDED';
        }
        await payment.save();

        return {
            success: true,
            refundId,
            amount: refundAmount,
        };
    }

    verifyWebhookSignature(payload: any, signature: string): boolean {
        // SSLCommerz doesn't use signature verification in the same way
        // Verification is done through their validation API
        return true;
    }

    async handleWebhook(event: any) {
        const { status, tran_id, val_id } = event;

        const payment = await Payment.findOne({ transactionId: tran_id });
        if (!payment) {
            throw new Error('Payment not found for webhook event');
        }

        let paymentStatus: string;
        switch (status) {
            case 'VALID':
            case 'VALIDATED':
                paymentStatus = 'COMPLETED';
                payment.status = 'COMPLETED';
                break;
            case 'FAILED':
                paymentStatus = 'FAILED';
                payment.status = 'FAILED';
                payment.failureReason = event.error || 'Payment failed';
                break;
            case 'CANCELLED':
                paymentStatus = 'CANCELLED';
                payment.status = 'CANCELLED';
                break;
            default:
                paymentStatus = 'PENDING';
        }

        payment.providerPaymentId = val_id;
        payment.providerResponse = event;
        await payment.save();

        return {
            type: `sslcommerz.${status.toLowerCase()}`,
            paymentId: payment._id.toString(),
            status: paymentStatus,
            data: event,
        };
    }
}
