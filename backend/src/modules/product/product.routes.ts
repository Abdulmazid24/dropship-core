import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { Product } from './product.model';
import { asyncHandler, AppError } from '../../shared/middleware/error.middleware';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const router = Router();

// Validation schemas
const createProductSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
    supplierId: z.string(),
    category: z.string().optional(),
    images: z.array(z.string()).optional(),
});

const updateProductSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    category: z.string().optional(),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
});

/**
 * @route   GET /api/products
 * @desc    Get all products (with pagination and filters)
 * @access  Public
 */
router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const category = req.query.category as string;
        const search = req.query.search as string;
        const isActive = req.query.isActive !== 'false'; // default true

        const query: any = { isActive };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('supplierId', 'name type')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    })
);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const product = await Product.findById(req.params.id).populate(
            'supplierId',
            'name type contactEmail'
        );

        if (!product) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        res.json({
            success: true,
            data: { product },
        });
    })
);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin only)
 */
router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const data = createProductSchema.parse(req.body);

        const product = await Product.create(data);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product },
        });
    })
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin only)
 */
router.put(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const data = updateProductSchema.parse(req.body);

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!product) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product },
        });
    })
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete - set isActive to false)
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!product) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    })
);

export default router;
