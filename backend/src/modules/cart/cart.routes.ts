import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { Cart } from './cart.model';
import { Variant } from '../variant/variant.model';
import { asyncHandler, AppError } from '../../shared/middleware/error.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Validation schemas
const addToCartSchema = z.object({
    variantId: z.string(),
    qty: z.number().int().min(1),
});

const updateCartItemSchema = z.object({
    qty: z.number().int().min(1),
});

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        let cart = await Cart.findOne({ userId: req.user?.userId }).populate({
            path: 'items.variantId',
            populate: {
                path: 'productId',
                select: 'title images',
            },
        });

        // Create cart if doesn't exist
        if (!cart) {
            cart = await Cart.create({
                userId: req.user?.userId,
                items: [],
            });
        }

        res.json({
            success: true,
            data: { cart },
        });
    })
);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
    '/items',
    asyncHandler(async (req: Request, res: Response) => {
        const { variantId, qty } = addToCartSchema.parse(req.body);

        // Check if variant exists and has enough quantity
        const variant = await Variant.findById(variantId);
        if (!variant) {
            throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
        }

        if (variant.availableQty < qty) {
            throw new AppError(
                `Only ${variant.availableQty} items available`,
                400,
                'INSUFFICIENT_QUANTITY'
            );
        }

        // Get or create cart
        let cart = await Cart.findOne({ userId: req.user?.userId });

        if (!cart) {
            cart = await Cart.create({
                userId: req.user?.userId,
                items: [{ variantId, qty }],
            });
        } else {
            // Check if item already exists in cart
            const existingItemIndex = cart.items.findIndex(
                (item) => item.variantId.toString() === variantId
            );

            if (existingItemIndex > -1) {
                // Update quantity
                cart.items[existingItemIndex].qty += qty;

                // Check if total quantity exceeds available
                if (cart.items[existingItemIndex].qty > variant.availableQty) {
                    throw new AppError(
                        `Only ${variant.availableQty} items available`,
                        400,
                        'INSUFFICIENT_QUANTITY'
                    );
                }
            } else {
                // Add new item
                cart.items.push({ variantId: variantId as any, qty });
            }

            await cart.save();
        }

        // Populate cart for response
        await cart.populate({
            path: 'items.variantId',
            populate: {
                path: 'productId',
                select: 'title images',
            },
        });

        res.json({
            success: true,
            message: 'Item added to cart',
            data: { cart },
        });
    })
);

/**
 * @route   PUT /api/cart/items/:variantId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put(
    '/items/:variantId',
    asyncHandler(async (req: Request, res: Response) => {
        const { qty } = updateCartItemSchema.parse(req.body);
        const { variantId } = req.params;

        const cart = await Cart.findOne({ userId: req.user?.userId });

        if (!cart) {
            throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
        }

        // Find item in cart
        const itemIndex = cart.items.findIndex(
            (item) => item.variantId.toString() === variantId
        );

        if (itemIndex === -1) {
            throw new AppError('Item not found in cart', 404, 'ITEM_NOT_FOUND');
        }

        // Check variant availability
        const variant = await Variant.findById(variantId);
        if (!variant) {
            throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
        }

        if (variant.availableQty < qty) {
            throw new AppError(
                `Only ${variant.availableQty} items available`,
                400,
                'INSUFFICIENT_QUANTITY'
            );
        }

        // Update quantity
        cart.items[itemIndex].qty = qty;
        await cart.save();

        // Populate cart for response
        await cart.populate({
            path: 'items.variantId',
            populate: {
                path: 'productId',
                select: 'title images',
            },
        });

        res.json({
            success: true,
            message: 'Cart updated',
            data: { cart },
        });
    })
);

/**
 * @route   DELETE /api/cart/items/:variantId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete(
    '/items/:variantId',
    asyncHandler(async (req: Request, res: Response) => {
        const { variantId } = req.params;

        const cart = await Cart.findOne({ userId: req.user?.userId });

        if (!cart) {
            throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
        }

        // Filter out the item
        cart.items = cart.items.filter(
            (item) => item.variantId.toString() !== variantId
        );

        await cart.save();

        // Populate cart for response
        await cart.populate({
            path: 'items.variantId',
            populate: {
                path: 'productId',
                select: 'title images',
            },
        });

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: { cart },
        });
    })
);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const cart = await Cart.findOne({ userId: req.user?.userId });

        if (!cart) {
            throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
        }

        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            message: 'Cart cleared',
            data: { cart },
        });
    })
);

export default router;
