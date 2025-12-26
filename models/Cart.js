import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    priceAtTime: {
        type: Number,
        required: true
    }, // Snapshot of price when added to cart
}, { _id: true });

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },

        items: [cartItemSchema],
    },
    { timestamps: true }
);

// Index for faster user cart lookups
cartSchema.index({ userId: 1 });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
