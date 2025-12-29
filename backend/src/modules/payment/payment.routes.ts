import { Request, Response, Router } from 'express';
import { z } from 'zod';
import express from 'express';
import { PaymentProviderFactory } from './payment.interface';
import { getRecommendedProvider } from './payment.service';
import { Payment } from './payment.model';
import { Order } from '../order/order.model';
import { asyncHandler, AppError } from '../../shared/middleware/error.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// Validation schemas
const createPaymentSchema = z.object({
    orderId: z.string(),
    provider: z.enum(['STRIPE', 'SSLCOMMERZ']).optional(),
    currency: z.string().default('USD'),
    metadata: z.record(z.any()).optional(),
});

const verifyPaymentSchema = z.object({
    paymentId: z.string(),
    providerPaymentId: z.string(),
});

/**
 * @route   POST /api/payment/create
 * @desc    Create payment intent
 * @access  Private
 */
router.post(
    '/create',
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
        const { orderId, provider, currency, metadata } = createPaymentSchema.parse(req.body);

        // Get order
        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }

        // Verify user owns this order
        if (order.userId.toString() !== req.user?.userId) {
            throw new AppError('Unauthorized', 403, 'UNAUTHORIZED');
        }

        // Check if order already has a successful payment
        const existingPayment = await Payment.findOne({
            orderId,
            status: 'COMPLETED',
        });

        if (existingPayment) {
            throw new AppError('Order already paid', 400, 'ORDER_ALREADY_PAID');
        }

        // Select provider
        const selectedProvider = provider || getRecommendedProvider(currency);
        const paymentProvider = PaymentProviderFactory.getProvider(selectedProvider);

        // Create payment intent
        const paymentData = await paymentProvider.createPaymentIntent(
            order.totalAmount,
            currency,
            {
                ...metadata,
                orderId: order._id.toString(),
                userId: req.user?.userId,
                idempotencyKey: `${orderId}-${Date.now()}`,
            }
        );

        res.json({
            success: true,
            data: {
                ...paymentData,
                provider: selectedProvider,
                amount: order.totalAmount,
                currency,
            },
        });
    })
);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify payment status
 * @access  Private
 */
router.post(
    '/verify',
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
        const { paymentId, providerPaymentId } = verifyPaymentSchema.parse(req.body);

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
        }

        const provider = PaymentProviderFactory.getProvider(payment.provider);
        const result = await provider.verifyPayment(paymentId, providerPaymentId);

        // Update order status if payment successful
        if (result.success) {
            await Order.findByIdAndUpdate(payment.orderId, {
                $set: {
                    paymentStatus: 'PAID',
                    paymentId: payment._id,
                },
            });
        }

        res.json({
            success: true,
            data: result,
        });
    })
);

/**
 * @route   POST /api/payment/refund/:id
 * @desc    Refund payment
 * @access  Private (Admin or order owner)
 */
router.post(
    '/refund/:id',
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
        const { amount } = z.object({ amount: z.number().optional() }).parse(req.body);

        const payment = await Payment.findById(req.params.id).populate('orderId');
        if (!payment) {
            throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
        }

        const order = payment.orderId as any;

        // Verify authorization
        if (
            req.user?.role !== 'ADMIN' &&
            order.userId.toString() !== req.user?.userId
        ) {
            throw new AppError('Unauthorized ', 403, 'UNAUTHORIZED');
        }

        if (payment.status !== 'COMPLETED') {
            throw new AppError('Can only refund completed payments', 400, 'INVALID_PAYMENT_STATUS');
        }

        const provider = PaymentProviderFactory.getProvider(payment.provider);
        const result = await provider.refundPayment(req.params.id, amount);

        // Update order status
        await Order.findByIdAndUpdate(payment.orderId, {
            $set: { paymentStatus: 'REFUNDED' },
        });

        res.json({
            success: true,
            message: 'Payment refunded successfully',
            data: result,
        });
    })
);

/**
 * @route   POST /api/payment/webhook/stripe
 * @desc    Handle Stripe webhooks
 * @access  Public (Stripe signature verification)
 */
router.post(
    '/webhook/stripe',
    express.raw({ type: 'application/json' }),
    asyncHandler(async (req: Request, res: Response) => {
        const signature = req.headers['stripe-signature'] as string;

        const provider = PaymentProviderFactory.getProvider('STRIPE');

        if (!provider.verifyWebhookSignature(req.body, signature)) {
            throw new AppError('Invalid webhook signature', 400, 'INVALID_SIGNATURE');
        }

        const event = JSON.parse(req.body.toString());
        const result = await provider.handleWebhook(event);

        // Update order status based on payment status
        if (result.status === 'COMPLETED') {
            const payment = await Payment.findById(result.paymentId);
            if (payment) {
                await Order.findByIdAndUpdate(payment.orderId, {
                    $set: {
                        paymentStatus: 'PAID',
                        paymentId: payment._id,
                    },
                });
            }
        }

        res.json({ received: true });
    })
);

/**
 * @route   POST /api/payment/webhook/sslcommerz
 * @desc    Handle SSLCommerz IPN
 * @access  Public
 */
router.post(
    '/webhook/sslcommerz',
    asyncHandler(async (req: Request, res: Response) => {
        const provider = PaymentProviderFactory.getProvider('SSLCOMMERZ');
        const result = await provider.handleWebhook(req.body);

        // Update order status based on payment status
        if (result.status === 'COMPLETED') {
            const payment = await Payment.findById(result.paymentId);
            if (payment) {
                await Order.findByIdAndUpdate(payment.orderId, {
                    $set: {
                        paymentStatus: 'PAID',
                        paymentId: payment._id,
                    },
                });
            }
        }

        res.json({ status: 'OK' });
    })
);

/**
 * @route   GET /api/payment/:id
 * @desc    Get payment details
 * @access  Private
 */
router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
        const payment = await Payment.findById(req.params.id).populate('orderId userId');

        if (!payment) {
            throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
        }

        const order = payment.orderId as any;

        // Verify authorization
        if (
            req.user?.role !== 'ADMIN' &&
            order.userId.toString() !== req.user?.userId
        ) {
            throw new AppError('Unauthorized', 403, 'UNAUTHORIZED');
        }

        res.json({
            success: true,
            data: { payment },
        });
    })
);

export default router;
