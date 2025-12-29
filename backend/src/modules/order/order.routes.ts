import { Request, Response, Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Order } from './order.model';
import { Cart } from '../cart/cart.model';
import { Variant } from '../variant/variant.model';
import { asyncHandler, AppError } from '../../shared/middleware/error.middleware';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const router = Router();

// Validation schemas
const createOrderSchema = z.object({
    shippingAddress: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string(),
    }),
    notes: z.string().optional(),
});

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 */
router.post(
    '/',
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
        const { shippingAddress, notes } = createOrderSchema.parse(req.body);

        // Get user's cart
        const cart = await Cart.findOne({ userId: req.user?.userId }).populate({
            path: 'items.variantId',
            populate: { path: 'productId' },
        });

        if (!cart || cart.items.length === 0) {
            throw new AppError('Cart is empty', 400, 'EMPTY_CART');
        }

        // Start MongoDB session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Reserve inventory and create order items
            const orderItems = [];
            let totalAmount = 0;

            for (const cartItem of cart.items) {
                const variant = await Variant.findById(cartItem.variantId);

                if (!variant) {
                    throw new AppError(
                        `Variant ${cartItem.variantId} not found`,
                        404,
                        'VARIANT_NOT_FOUND'
                    );
                }

                // Check availability
                if (variant.availableQty < cartItem.qty) {
                    throw new AppError(
                        `Insufficient stock for ${variant.sku}. Only ${variant.availableQty} available`,
                        400,
                        'INSUFFICIENT_STOCK'
                    );
                }

                // Reserve inventory (atomic operation)
                const updated = await Variant.findOneAndUpdate(
                    {
                        _id: variant._id,
                        availableQty: { $gte: cartItem.qty },
                    },
                    {
                        $inc: {
                            availableQty: -cartItem.qty,
                            reservedQty: cartItem.qty,
                        },
                    },
                    { session, new: true }
                );

                if (!updated) {
                    throw new AppError(
                        `Failed to reserve ${variant.sku}. Stock may have changed`,
                        409,
                        'RESERVATION_FAILED'
                    );
                }

                // Get product info
                const product = cartItem.variantId.productId as any;

                orderItems.push({
                    variantId: variant._id,
                    qty: cartItem.qty,
                    supplierId: product.supplierId,
                    priceAtPurchase: variant.sellingPrice,
                });

                totalAmount += variant.sellingPrice * cartItem.qty;
            }

            // Create order
            const order = await Order.create(
                [
                    {
                        userId: req.user?.userId,
                        items: orderItems,
                        totalAmount,
                        shippingAddress,
                        notes,
                        paymentStatus: 'PENDING',
                        orderStatus: 'PENDING',
                    },
                ],
                { session }
            );

            // Clear cart
            cart.items = [];
            await cart.save({ session });

            await session.commitTransaction();

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: { order: order[0] },
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    })
);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get(
    '/',
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
        const orders = await Order.find({ userId: req.user?.userId })
            .populate({
                path: 'items.variantId',
                populate: { path: 'productId' },
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { orders },
        });
    })
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'items.variantId',
                populate: { path: 'productId' },
            })
            .populate('paymentId');

        if (!order) {
            throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }

        // Verify authorization
        if (
            req.user?.role !== 'ADMIN' &&
            order.userId.toString() !== req.user?.userId
        ) {
            throw new AppError('Unauthorized', 403, 'UNAUTHORIZED');
        }

        res.json({
            success: true,
            data: { order },
        });
    })
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order (release inventory)
 * @access  Private
 */
router.put(
    '/:id/cancel',
    authenticate,
    asyncHandler(async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.id);

        if (!order) {
            throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }

        // Verify authorization
        if (order.userId.toString() !== req.user?.userId) {
            throw new AppError('Unauthorized', 403, 'UNAUTHORIZED');
        }

        // Can only cancel pending or processing orders
        if (!['PENDING', 'PROCESSING'].includes(order.orderStatus)) {
            throw new AppError(
                'Cannot cancel order in current status',
                400,
                'INVALID_STATUS'
            );
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Release reserved inventory
            for (const item of order.items) {
                await Variant.findByIdAndUpdate(
                    item.variantId,
                    {
                        $inc: {
                            availableQty: item.qty,
                            reservedQty: -item.qty,
                        },
                    },
                    { session }
                );
            }

            // Update order status
            order.orderStatus = 'CANCELLED';
            await order.save({ session });

            await session.commitTransaction();

            res.json({
                success: true,
                message: 'Order cancelled successfully',
                data: { order },
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    })
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin only)
 * @access  Private (Admin)
 */
router.put(
    '/:id/status',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const { orderStatus, trackingNumber } = z
            .object({
                orderStatus: z.enum([
                    'PENDING',
                    'PROCESSING',
                    'SHIPPED',
                    'DELIVERED',
                    'CANCELLED',
                ]),
                trackingNumber: z.string().optional(),
            })
            .parse(req.body);

        const order = await Order.findById(req.params.id);

        if (!order) {
            throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }

        order.orderStatus = orderStatus;
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }
        await order.save();

        res.json({
            success: true,
            message: 'Order status updated',
            data: { order },
        });
    })
);

export default router;
