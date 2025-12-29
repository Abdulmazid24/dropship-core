import { Schema, model, Document, Types } from 'mongoose';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus =
    | 'CREATED'
    | 'PAYMENT_PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

export interface IOrderItem {
    variantId: Types.ObjectId;
    qty: number;
    supplierId: Types.ObjectId;
    priceAtPurchase: number; // Lock in price at time of order
}

export interface IOrder extends Document {
    userId: Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    paymentId?: Types.ObjectId;
    shippingAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state?: string;
        postalCode: string;
        country: string;
    };
    trackingNumber?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
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
        supplierId: {
            type: Schema.Types.ObjectId,
            ref: 'Supplier',
            required: [true, 'Supplier is required'],
        },
        priceAtPurchase: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
    },
    { _id: false }
);

const shippingAddressSchema = new Schema(
    {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        addressLine1: { type: String, required: true, trim: true },
        addressLine2: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const orderSchema = new Schema<IOrder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        items: {
            type: [orderItemSchema],
            required: [true, 'Order items are required'],
            validate: {
                validator: (items: IOrderItem[]) => items.length > 0,
                message: 'Order must have at least one item',
            },
        },
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount cannot be negative'],
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
            default: 'PENDING',
        },
        orderStatus: {
            type: String,
            enum: [
                'CREATED',
                'PAYMENT_PENDING',
                'CONFIRMED',
                'PROCESSING',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED',
            ],
            default: 'CREATED',
        },
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: 'Payment',
        },
        shippingAddress: {
            type: shippingAddressSchema,
            required: [true, 'Shipping address is required'],
        },
        trackingNumber: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'items.variantId': 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for total items
orderSchema.virtual('totalItems').get(function () {
    return this.items.reduce((total, item) => total + item.qty, 0);
});

// Include virtuals in JSON
orderSchema.set('toJSON', { virtuals: true });

export const Order = model<IOrder>('Order', orderSchema);
