import Stripe from 'stripe';
import { IPaymentProvider } from './payment.interface';
import { env } from '../../config/env';
import { Payment } from './payment.model';

export class StripeProvider implements IPaymentProvider {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia',
        });
    }

    async createPaymentIntent(
        amount: number,
        currency: string,
        metadata: Record<string, any>
    ) {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Create payment record in database
        const payment = await Payment.create({
            orderId: metadata.orderId,
            userId: metadata.userId,
            provider: 'STRIPE',
            amount,
            currency,
            status: 'PENDING',
            providerPaymentId: paymentIntent.id,
            idempotencyKey: metadata.idempotencyKey,
        });

        return {
            paymentId: payment._id.toString(),
            clientSecret: paymentIntent.client_secret!,
            providerPaymentId: paymentIntent.id,
        };
    }

    async verifyPayment(paymentId: string, providerPaymentId: string) {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(
            providerPaymentId
        );

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }

        const status =
            paymentIntent.status === 'succeeded'
                ? 'COMPLETED'
                : paymentIntent.status === 'processing'
                    ? 'PENDING'
                    : 'FAILED';

        // Update payment record
        payment.status = status;
        payment.transactionId = paymentIntent.id;
        payment.providerResponse = paymentIntent;
        if (status === 'FAILED') {
            payment.failureReason = paymentIntent.last_payment_error?.message;
        }
        await payment.save();

        return {
            success: status === 'COMPLETED',
            status,
            transactionId: paymentIntent.id,
            providerResponse: paymentIntent,
        };
    }

    async refundPayment(paymentId: string, amount?: number) {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }

        const refund = await this.stripe.refunds.create({
            payment_intent: payment.providerPaymentId!,
            amount: amount ? Math.round(amount * 100) : undefined,
        });

        // Update payment record
        payment.refundedAmount = (payment.refundedAmount || 0) + (refund.amount / 100);
        payment.refundedAt = new Date();
        if (payment.refundedAmount >= payment.amount) {
            payment.status = 'REFUNDED';
        }
        await payment.save();

        return {
            success: true,
            refundId: refund.id,
            amount: refund.amount / 100,
        };
    }

    verifyWebhookSignature(payload: any, signature: string): boolean {
        try {
            this.stripe.webhooks.constructEvent(
                payload,
                signature,
                env.STRIPE_WEBHOOK_SECRET
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    async handleWebhook(event: any) {
        const paymentIntent = event.data.object;

        const payment = await Payment.findOne({
            providerPaymentId: paymentIntent.id,
        });

        if (!payment) {
            throw new Error('Payment not found for webhook event');
        }

        let status: string;
        switch (event.type) {
            case 'payment_intent.succeeded':
                status = 'COMPLETED';
                payment.status = 'COMPLETED';
                payment.transactionId = paymentIntent.id;
                break;
            case 'payment_intent.payment_failed':
                status = 'FAILED';
                payment.status = 'FAILED';
                payment.failureReason = paymentIntent.last_payment_error?.message;
                break;
            default:
                status = 'PENDING';
        }

        payment.providerResponse = paymentIntent;
        await payment.save();

        return {
            type: event.type,
            paymentId: payment._id.toString(),
            status,
            data: paymentIntent,
        };
    }
}
