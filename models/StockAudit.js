import mongoose from 'mongoose';

const stockAuditSchema = new mongoose.Schema(
    {
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductVariant',
            required: true,
            index: true
        },

        action: {
            type: String,
            enum: ['deducted', 'added', 'adjusted', 'returned'],
            required: true
        },

        quantity: {
            type: Number,
            required: true
        },

        previousStock: {
            type: Number,
            required: true
        },

        newStock: {
            type: Number,
            required: true
        },

        reason: {
            type: String,
            required: true
        }, // "ORDER_PAYMENT", "ADMIN_ADJUSTMENT", "RETURN", etc.

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null
        },

        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }, // Admin who made the change, null for automated

        notes: {
            type: String
        },
    },
    { timestamps: true }
);

// Indexes for audit queries
stockAuditSchema.index({ variantId: 1, createdAt: -1 });
stockAuditSchema.index({ orderId: 1 });

const StockAudit = mongoose.model('StockAudit', stockAuditSchema);
export default StockAudit;
