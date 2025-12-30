import asyncHandler from 'express-async-handler';
import Product from '../models/product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import ProductVariant from '../models/ProductVariant.js';
import Transaction from '../models/Transaction.js';

// @desc    Search products for POS
// @route   GET /api/pos/products
// @access  Private/Admin
export const posSearchProducts = asyncHandler(async (req, res) => {
    const { query } = req.query;

    let filter = { status: 'active' };

    if (query) {
        // If query matches an ID length, check _id or SKU exact match first
        if (query.match(/^[0-9a-fA-F]{24}$/)) {
            filter._id = query;
        } else {
            // Regex search on name or brand
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { sku: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ];
        }
    }

    // Fetch products
    const products = await Product.find(filter).limit(20).lean();

    // Attach variants if any
    const results = [];
    for (const p of products) {
        if (p.hasVariants) {
            // If SKU was searched, we might want to find the specific variant
            let variantFilter = { productId: p._id, status: { $ne: 'inactive' } };
            if (query && !p.name.match(new RegExp(query, 'i'))) {
                // If the main product query didn't match name, maybe it matched variant SKU?
                variantFilter.sku = { $regex: query, $options: 'i' };
            }

            const variants = await ProductVariant.find(variantFilter).lean();

            if (variants.length > 0) {
                // Add product with variants
                results.push({ ...p, variants });
            } else if (!query) {
                // If no specific query, just show product
                results.push(p);
            }
        } else {
            results.push(p);
        }
    }

    res.json(results);
});

// @desc    Search customers for POS
// @route   GET /api/pos/customers
// @access  Private/Admin
export const posSearchCustomers = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);

    const customers = await User.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } } // Assuming phone exists
        ]
    }).select('_id name email phone').limit(10);

    res.json(customers);
});

// @desc    Create POS Order
// @route   POST /api/pos/orders
// @access  Private/Admin
// @desc    Create POS Order
// @route   POST /api/pos/orders
// @access  Private/Admin
export const posCreateOrder = asyncHandler(async (req, res) => {
    try {
        const {
            customerId, // Optional
            items, // [{ productId, variantId, qty, price }]
            paymentMethod, // 'Cash', 'Card', 'Split'
            amountPaid,
            discount // { type: 'fixed' | 'percent', value }
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in cart' });
        }

        // 1. Calculate Totals & Validate Stock
        let orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            let finalPrice = item.price;
            let finalSku = product.sku || 'N/A';
            let name = product.name;
            let attributes = {};

            // Decrement Stock
            if (item.variantId) {
                const variant = await ProductVariant.findById(item.variantId);
                if (!variant) throw new Error('Variant not found');

                if (variant.stock < item.qty) {
                    throw new Error(`Insufficient stock for ${product.name} (${variant.sku})`);
                }

                // Convert Map to Object safely
                const variantObj = variant.toObject({ flattenMaps: true });
                attributes = variantObj.attributes || {};

                // Update specific attributes string for name
                const attrString = Object.values(attributes).join(' ');
                if (attrString) name = `${product.name} (${attrString})`;

                finalSku = variant.sku;

                variant.stock -= item.qty;
                await variant.save();
            } else {
                if (product.stock < item.qty) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }
                product.stock -= item.qty;
                await product.save();
            }

            orderItems.push({
                product: product._id,
                name: name,
                qty: item.qty,
                price: finalPrice,
                image: product.images?.[0]?.url || product.image,
                sku: finalSku,
                variantId: item.variantId,
                attributes: attributes // Store raw map/obj
            });

            subtotal += finalPrice * item.qty;
        }

        // 2. Apply Discount
        let discountValue = 0;
        if (discount && discount.value) {
            if (discount.type === 'percent') {
                discountValue = subtotal * (discount.value / 100);
            } else {
                discountValue = discount.value;
            }
        }

        const finalAmount = Math.max(0, subtotal - discountValue);

        // 3. Create Order
        const order = new Order({
            user: customerId || req.user._id, // If walk-in, assign to admin or customer
            orderItems,
            shippingAddress: { // Dummy address for POS
                fullName: 'Walk-in Customer',
                address: 'In-store Pickup',
                city: 'N/A',
                country: 'N/A',
                phone: 'N/A'
            },
            paymentMethod: paymentMethod || 'Cash',
            paymentStatus: 'Paid',
            totalPrice: subtotal,
            discountValue: discountValue,
            discountType: (discount && discount.value > 0) ? discount.type : undefined,
            shippingFee: 0,
            finalAmount: finalAmount,
            status: 'Delivered', // Immediate completion
            // orderSource: 'POS' 
        });

        // If specific customer selected, link them
        if (customerId) {
            order.user = customerId;
        }

        await order.save();

        // 4. Create Transaction record for the Paid POS order
        try {
            const transactionId = `POS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const posTransaction = new Transaction({
                user: order.user,
                mpesaReceiptNumber: transactionId,
                phoneNumber: 'POS-WalkIn',
                amount: finalAmount,
                status: 'Success',
                rawResponse: {
                    source: 'POS',
                    paymentMethod: paymentMethod,
                    orderId: order._id
                }
            });
            await posTransaction.save();
            console.log(`POS Transaction created: ${transactionId}`);
        } catch (txError) {
            console.error('Failed to create POS transaction record:', txError.message);
            // Don't fail the order response just because transaction log failed, but log it.
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('POS Create Order Error:', error);
        res.status(500).json({ message: error.message || 'Server Error processing POS order' });
    }
});
