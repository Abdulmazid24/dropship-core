import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct extends Document {
    title: string;
    description: string;
    supplierId: Types.ObjectId;
    category?: string;
    images?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        title: {
            type: String,
            required: [true, 'Product title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        supplierId: {
            type: Schema.Types.ObjectId,
            ref: 'Supplier',
            required: [true, 'Supplier is required'],
        },
        category: {
            type: String,
            trim: true,
        },
        images: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
productSchema.index({ title: 'text', description: 'text' }); // Full-text search
productSchema.index({ supplierId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 }); // For sorting by newest

export const Product = model<IProduct>('Product', productSchema);
