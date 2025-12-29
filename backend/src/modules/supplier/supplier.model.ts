import { Schema, model, Document } from 'mongoose';

export interface ISupplier extends Document {
    name: string;
    type: 'LOCAL' | 'INTERNATIONAL';
    apiEndpoint?: string;
    apiKey?: string;
    contactEmail: string;
    contactPhone?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
    {
        name: {
            type: String,
            required: [true, 'Supplier name is required'],
            trim: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ['LOCAL', 'INTERNATIONAL'],
            required: [true, 'Supplier type is required'],
        },
        apiEndpoint: {
            type: String,
            trim: true,
        },
        apiKey: {
            type: String,
            trim: true,
            select: false, // Don't include in queries by default
        },
        contactEmail: {
            type: String,
            required: [true, 'Contact email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        contactPhone: {
            type: String,
            trim: true,
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
supplierSchema.index({ name: 1 });
supplierSchema.index({ type: 1 });
supplierSchema.index({ isActive: 1 });

export const Supplier = model<ISupplier>('Supplier', supplierSchema);
