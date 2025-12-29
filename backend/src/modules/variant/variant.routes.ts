import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { Variant } from './variant.model';
import { Product } from '../product/product.model';
import { asyncHandler, AppError } from '../../shared/middleware/error.middleware';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const router = Router();

// Validation schemas
const createVariantSchema = z.object({
    productId: z.string(),
    sku: z.string().min(3).max(50).toUpperCase(),
    attributes: z.record(z.any()).optional(),
    supplierPrice: z.number().min(0),
    sellingPrice: z.number().min(0),
    availableQty: z.number().int().min(0).default(0),
});

const updateVariantSchema = z.object({
    sku: z.string().min(3).max(50).toUpperCase().optional(),
    attributes: z.record(z.any()).optional(),
    supplierPrice: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    availableQty: z.number().int().min(0).optional(),
});

/**
 * @route   GET /api/variants
 * @desc    Get all variants (with filters)
 * @access  Public
 */
router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const productId = req.query.productId as string;
        const inStock = req.query.inStock === 'true';

        const query: any = {};

        if (productId) {
            query.productId = productId;
        }

        if (inStock) {
            query.availableQty = { $gt: 0 };
        }

        const variants = await Variant.find(query)
            .populate('productId', 'title description')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { variants },
        });
    })
);

/**
 * @route   GET /api/variants/:id
 * @desc    Get single variant by ID
 * @access  Public
 */
router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const variant = await Variant.findById(req.params.id).populate(
            'productId',
            'title description supplierId'
        );

        if (!variant) {
            throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
        }

        res.json({
            success: true,
            data: { variant },
        });
    })
);

/**
 * @route   GET /api/variants/sku/:sku
 * @desc    Get variant by SKU
 * @access  Public
 */
router.get(
    '/sku/:sku',
    asyncHandler(async (req: Request, res: Response) => {
        const variant = await Variant.findOne({
            sku: req.params.sku.toUpperCase(),
        }).populate('productId', 'title description');

        if (!variant) {
            throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
        }

        res.json({
            success: true,
            data: { variant },
        });
    })
);

/**
 * @route   POST /api/variants
 * @desc    Create new variant
 * @access  Private (Admin only)
 */
router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const data = createVariantSchema.parse(req.body);

        // Check if product exists
        const product = await Product.findById(data.productId);
        if (!product) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        // Check if SKU already exists
        const existingVariant = await Variant.findOne({ sku: data.sku });
        if (existingVariant) {
            throw new AppError(
                'SKU already exists',
                409,
                'DUPLICATE_SKU'
            );
        }

        const variant = await Variant.create(data);

        res.status(201).json({
            success: true,
            message: 'Variant created successfully',
            data: { variant },
        });
    })
);

/**
 * @route   PUT /api/variants/:id
 * @desc    Update variant
 * @access  Private (Admin only)
 */
router.put(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const data = updateVariantSchema.parse(req.body);

        // If updating SKU, check for duplicates
        if (data.sku) {
            const existingVariant = await Variant.findOne({
                sku: data.sku,
                _id: { $ne: req.params.id },
            });

            if (existingVariant) {
                throw new AppError(
                    'SKU already exists',
                    409,
                    'DUPLICATE_SKU'
                );
            }
        }

        const variant = await Variant.findByIdAndUpdate(
            req.params.id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!variant) {
            throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'Variant updated successfully',
            data: { variant },
        });
    })
);

/**
 * @route   DELETE /api/variants/:id
 * @desc    Delete variant
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const variant = await Variant.findByIdAndDelete(req.params.id);

        if (!variant) {
            throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'Variant deleted successfully',
        });
    })
);

/**
 * @route   POST /api/variants/:id/check-availability
 * @desc    Check variant availability for specific quantity
 * @access  Public
 */
router.post(
    '/:id/check-availability',
    asyncHandler(async (req: Request, res: Response) => {
        const { quantity } = z
            .object({ quantity: z.number().int().min(1) })
            .parse(req.body);

        const variant = await Variant.findById(req.params.id);

        if (!variant) {
            throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
        }

        const available = variant.availableQty >= quantity;

        res.json({
            success: true,
            data: {
                available,
                requestedQty: quantity,
                availableQty: variant.availableQty,
                reservedQty: variant.reservedQty,
            },
        });
    })
);

export default router;
