import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        }, // e.g., "TS-M-RED", "SHOE-42-BLK"

        attributes: {
            type: Map,
            of: String
        }, // e.g., { Size: "M", Color: "Red" }

        price: {
            type: Number,
            required: true,
            min: 0
        },

        discountPrice: {
            type: Number,
            min: 0,
            default: null
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        lowStockThreshold: {
            type: Number,
            min: 0,
            default: 10
        },

        image: {
            url: { type: String },
            public_id: { type: String }
        }, // Optional variant-specific image

        status: {
            type: String,
            enum: ['active', 'out_of_stock', 'inactive'],
            default: 'active'
        },

        // For tracking
        soldCount: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true,
        // Virtual field to auto-update status based on stock
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Auto-update status when stock changes
productVariantSchema.pre('save', function (next) {
    if (this.stock <= 0 && this.status === 'active') {
        this.status = 'out_of_stock';
    } else if (this.stock > 0 && this.status === 'out_of_stock') {
        this.status = 'active';
    }
    next();
});

// Index for faster queries
productVariantSchema.index({ productId: 1, status: 1 });
productVariantSchema.index({ stock: 1 });
productVariantSchema.index({ sku: 1 }, { unique: true });

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
export default ProductVariant;
