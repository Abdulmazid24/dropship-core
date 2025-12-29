import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { Supplier } from './supplier.model';
import { asyncHandler, AppError } from '../../shared/middleware/error.middleware';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const router = Router();

// Validation schemas
const createSupplierSchema = z.object({
    name: z.string().min(2).max(100),
    type: z.enum(['LOCAL', 'INTERNATIONAL']),
    apiEndpoint: z.string().url().optional(),
    apiKey: z.string().optional(),
    contactEmail: z.string().email(),
    contactPhone: z.string().optional(),
    isActive: z.boolean().default(true),
});

const updateSupplierSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    type: z.enum(['LOCAL', 'INTERNATIONAL']).optional(),
    apiEndpoint: z.string().url().optional(),
    apiKey: z.string().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    isActive: z.boolean().optional(),
});

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers
 * @access  Private (Admin only)
 */
router.get(
    '/',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const type = req.query.type as string;
        const isActive = req.query.isActive !== 'false'; // default true

        const query: any = { isActive };

        if (type) {
            query.type = type;
        }

        const suppliers = await Supplier.find(query).sort({ name: 1 });

        res.json({
            success: true,
            data: { suppliers },
        });
    })
);

/**
 * @route   GET /api/suppliers/:id
 * @desc    Get single supplier
 * @access  Private (Admin only)
 */
router.get(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const supplier = await Supplier.findById(req.params.id).select('+apiKey');

        if (!supplier) {
            throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
        }

        res.json({
            success: true,
            data: { supplier },
        });
    })
);

/**
 * @route   POST /api/suppliers
 * @desc    Create new supplier
 * @access  Private (Admin only)
 */
router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const data = createSupplierSchema.parse(req.body);

        const supplier = await Supplier.create(data);

        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            data: { supplier },
        });
    })
);

/**
 * @route   PUT /api/suppliers/:id
 * @desc    Update supplier
 * @access  Private (Admin only)
 */
router.put(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const data = updateSupplierSchema.parse(req.body);

        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!supplier) {
            throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'Supplier updated successfully',
            data: { supplier },
        });
    })
);

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Deactivate supplier
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req: Request, res: Response) => {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!supplier) {
            throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'Supplier deactivated successfully',
        });
    })
);

export default router;
