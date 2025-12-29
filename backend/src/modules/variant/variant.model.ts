import { Schema, model, Document, Types } from 'mongoose';

export interface IVariant extends Document {
    productId: Types.ObjectId;
    sku: string;
    attributes: {
        color?: string;
        size?: string;
        material?: string;
        [key: string]: any;
    };
    supplierPrice: number;
    sellingPrice: number;
    availableQty: number;
    reservedQty: number;
    lastSyncedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const variantSchema = new Schema<IVariant>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product is required'],
        },
        sku: {
            type: String,
            required: [true, 'SKU is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        attributes: {
            type: Schema.Types.Mixed,
            default: {},
        },
        supplierPrice: {
            type: Number,
            required: [true, 'Supplier price is required'],
            min: [0, 'Supplier price cannot be negative'],
        },
        sellingPrice: {
            type: Number,
            required: [true, 'Selling price is required'],
            min: [0, 'Selling price cannot be negative'],
        },
        availableQty: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Available quantity cannot be negative'],
        },
        reservedQty: {
            type: Number,
            default: 0,
            min: [0, 'Reserved quantity cannot be negative'],
        },
        lastSyncedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes (CRITICAL for inventory operations)
variantSchema.index({ sku: 1 }, { unique: true });
variantSchema.index({ productId: 1 });
variantSchema.index({ availableQty: 1 });
variantSchema.index({ lastSyncedAt: 1 });

// Compound index for inventory availability
variantSchema.index({ productId: 1, availableQty: 1 });

// Virtual for total in stock
variantSchema.virtual('totalInStock').get(function () {
    return this.availableQty + this.reservedQty;
});

// Virtual for profit margin
variantSchema.virtual('profitMargin').get(function () {
    return this.sellingPrice - this.supplierPrice;
});

// Virtual for profit percentage
variantSchema.virtual('profitPercentage').get(function () {
    if (this.supplierPrice === 0) return 0;
    return ((this.sellingPrice - this.supplierPrice) / this.supplierPrice) * 100;
});

// Include virtuals in JSON
variantSchema.set('toJSON', { virtuals: true });
variantSchema.set('toObject', { virtuals: true });

export const Variant = model<IVariant>('Variant', variantSchema);
