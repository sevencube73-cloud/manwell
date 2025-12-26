import Cart from '../models/Cart.js';
import ProductVariant from '../models/ProductVariant.js';
import Product from '../models/product.js';

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { variantId, quantity } = req.body;

        if (!variantId || !quantity || quantity < 1) {
            return res.status(400).json({ message: 'Valid variantId and quantity are required' });
        }

        // Verify variant exists and is available
        const variant = await ProductVariant.findById(variantId);
        if (!variant) {
            return res.status(404).json({ message: 'Product variant not found' });
        }

        if (variant.status === 'inactive') {
            return res.status(400).json({ message: 'This variant is not available' });
        }

        if (variant.status === 'out_of_stock' || variant.stock < quantity) {
            return res.status(400).json({
                message: 'Not enough stock available',
                availableStock: variant.stock
            });
        }

        // Get or create cart for user
        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = new Cart({
                userId: req.user._id,
                items: []
            });
        }

        // Check if variant already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.variantId.toString() === variantId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;

            if (newQuantity > variant.stock) {
                return res.status(400).json({
                    message: 'Not enough stock available',
                    availableStock: variant.stock,
                    currentInCart: cart.items[existingItemIndex].quantity
                });
            }

            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].priceAtTime = variant.discountPrice || variant.price;
        } else {
            // Add new item
            cart.items.push({
                variantId,
                quantity,
                priceAtTime: variant.discountPrice || variant.price
            });
        }

        await cart.save();

        // Populate cart for response
        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.variantId',
                populate: {
                    path: 'productId',
                    select: 'name images description'
                }
            });

        res.json({
            success: true,
            message: 'Item added to cart',
            cart: populatedCart
        });
    } catch (error) {
        console.error('addToCart error:', error);
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id })
            .populate({
                path: 'items.variantId',
                populate: {
                    path: 'productId',
                    select: 'name images description brand'
                }
            });

        if (!cart) {
            // Return empty cart
            return res.json({
                success: true,
                cart: {
                    userId: req.user._id,
                    items: []
                }
            });
        }

        // Filter out items with deleted variants
        const validItems = cart.items.filter(item => item.variantId);

        // Calculate totals
        let subtotal = 0;
        const formattedItems = validItems.map(item => {
            const variant = item.variantId;
            const product = variant.productId;
            const itemTotal = item.priceAtTime * item.quantity;
            subtotal += itemTotal;

            return {
                _id: item._id,
                variant: {
                    _id: variant._id,
                    sku: variant.sku,
                    attributes: variant.attributes,
                    price: variant.price,
                    discountPrice: variant.discountPrice,
                    stock: variant.stock,
                    status: variant.status,
                    image: variant.image?.url
                },
                product: {
                    _id: product._id,
                    name: product.name,
                    images: product.images,
                    description: product.description,
                    brand: product.brand
                },
                quantity: item.quantity,
                priceAtTime: item.priceAtTime,
                itemTotal
            };
        });

        res.json({
            success: true,
            cart: {
                _id: cart._id,
                userId: cart.userId,
                items: formattedItems,
                subtotal,
                itemCount: validItems.length
            }
        });
    } catch (error) {
        console.error('getCart error:', error);
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Valid quantity is required (>= 1)' });
        }

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.id(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Check variant stock
        const variant = await ProductVariant.findById(item.variantId);
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        if (quantity > variant.stock) {
            return res.status(400).json({
                message: 'Not enough stock available',
                availableStock: variant.stock
            });
        }

        item.quantity = quantity;
        item.priceAtTime = variant.discountPrice || variant.price; // Update price

        await cart.save();

        // Return updated cart
        const updatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.variantId',
                populate: {
                    path: 'productId',
                    select: 'name images description'
                }
            });

        res.json({
            success: true,
            message: 'Cart updated',
            cart: updatedCart
        });
    } catch (error) {
        console.error('updateCartItem error:', error);
        res.status(500).json({ message: 'Error updating cart item', error: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove item using pull
        const itemExists = cart.items.id(itemId);
        if (!itemExists) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items.pull(itemId);
        await cart.save();

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('removeCartItem error:', error);
        res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.json({
                success: true,
                message: 'Cart already empty'
            });
        }

        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('clearCart error:', error);
        res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
};

// @desc    Validate cart before checkout
// @route   POST /api/cart/validate
// @access  Private
export const validateCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.variantId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const issues = [];
        const validItems = [];

        for (const item of cart.items) {
            const variant = item.variantId;

            if (!variant) {
                issues.push({
                    itemId: item._id,
                    issue: 'Variant no longer exists'
                });
                continue;
            }

            if (variant.status === 'inactive') {
                issues.push({
                    itemId: item._id,
                    sku: variant.sku,
                    issue: 'Variant is no longer available'
                });
                continue;
            }

            if (variant.status === 'out_of_stock' || variant.stock === 0) {
                issues.push({
                    itemId: item._id,
                    sku: variant.sku,
                    issue: 'Out of stock'
                });
                continue;
            }

            if (item.quantity > variant.stock) {
                issues.push({
                    itemId: item._id,
                    sku: variant.sku,
                    issue: `Only ${variant.stock} available, you have ${item.quantity} in cart`
                });
                continue;
            }

            validItems.push(item);
        }

        res.json({
            success: true,
            valid: issues.length === 0,
            validItemCount: validItems.length,
            issues
        });
    } catch (error) {
        console.error('validateCart error:', error);
        res.status(500).json({ message: 'Error validating cart', error: error.message });
    }
};
