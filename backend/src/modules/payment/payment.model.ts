import { Schema, model, Document, Types } from 'mongoose';

export type PaymentProvider = 'STRIPE' | 'SSLCOMMERZ';
export type PaymentMethod = 'CARD' | 'MOBILE_BANKING' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface IPayment extends Document {
    orderId: Types.ObjectId;
    userId: Types.ObjectId;
    provider: PaymentProvider;
    method: PaymentMethod;
    amount: number;
    currency: string;
    status: PaymentStatus;
    transactionId?: string;
    providerPaymentId?: string;
    providerResponse?: any;
    idempotencyKey: string;
    failureReason?: string;
    refundedAmount?: number;
    refundedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Order is required'],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        provider: {
            type: String,
            enum: ['STRIPE', 'SSLCOMMERZ'],
            required: [true, 'Payment provider is required'],
        },
        method: {
            type: String,
            enum: ['CARD', 'MOBILE_BANKING', 'BANK_TRANSFER'],
            required: [true, 'Payment method is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        currency: {
            type: String,
            required: [true, 'Currency is required'],
            uppercase: true,
            default: 'USD',
        },
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'],
            default: 'PENDING',
        },
        transactionId: {
            type: String,
            trim: true,
            unique: true,
            sparse: true, // Allows multiple null values
        },
        providerPaymentId: {
            type: String,
            trim: true,
        },
        providerResponse: {
            type: Schema.Types.Mixed,
        },
        idempotencyKey: {
            type: String,
            required: [true, 'Idempotency key is required'],
            unique: true,
        },
        failureReason: {
            type: String,
            trim: true,
        },
        refundedAmount: {
            type: Number,
            min: [0, 'Refunded amount cannot be negative'],
        },
        refundedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ provider: 1 });
paymentSchema.index({ idempotencyKey: 1 }, { unique: true });
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ createdAt: -1 });

export const Payment = model<IPayment>('Payment', paymentSchema);
