import { Schema, model, Document, Types } from 'mongoose';

export interface ICartItem {
    variantId: Types.ObjectId;
    qty: number;
}

export interface ICart extends Document {
    userId: Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
    {
        variantId: {
            type: Schema.Types.ObjectId,
            ref: 'Variant',
            required: [true, 'Variant is required'],
        },
        qty: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
        },
    },
    { _id: false }
);

const cartSchema = new Schema<ICart>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
            unique: true, // One cart per user
        },
        items: {
            type: [cartItemSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
cartSchema.index({ userId: 1 }, { unique: true });
cartSchema.index({ 'items.variantId': 1 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function () {
    return this.items.reduce((total, item) => total + item.qty, 0);
});

// Include virtuals in JSON
cartSchema.set('toJSON', { virtuals: true });

export const Cart = model<ICart>('Cart', cartSchema);
