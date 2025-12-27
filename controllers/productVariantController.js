import ProductVariant from '../models/ProductVariant.js';
import Product from '../models/product.js';
import StockAudit from '../models/StockAudit.js';

// Helper to update product total stock
const syncProductStock = async (productId) => {
    try {
        const variants = await ProductVariant.find({ productId });
        const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        await Product.findByIdAndUpdate(productId, { totalStock });
    } catch (err) {
        console.error('Error syncing product stock:', err);
    }
};

// @desc    Create single product variant
// @route   POST /api/products/:productId/variants
// @access  Admin
export const createVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        const { sku, attributes, price, discountPrice, stock, lowStockThreshold, image } = req.body;

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if SKU already exists
        const existingSku = await ProductVariant.findOne({ sku: sku.toUpperCase() });
        if (existingSku) {
            return res.status(400).json({ message: 'SKU already exists' });
        }

        const variant = new ProductVariant({
            productId,
            sku: sku.toUpperCase(),
            attributes: attributes || {},
            price,
            discountPrice: discountPrice || null,
            stock: stock || 0,
            lowStockThreshold: lowStockThreshold || 10,
            image: image || null,
            status: 'active'
        });

        await variant.save();

        // If product doesn't have hasVariants flag, set it
        if (!product.hasVariants) {
            product.hasVariants = true;
            await product.save();
        }

        await syncProductStock(productId);

        // Create audit log
        await StockAudit.create({
            variantId: variant._id,
            action: 'added',
            quantity: stock || 0,
            previousStock: 0,
            newStock: stock || 0,
            reason: 'VARIANT_CREATED',
            performedBy: req.user?._id || null,
            notes: 'Initial stock on variant creation'
        });

        res.status(201).json({
            success: true,
            message: 'Variant created successfully',
            variant
        });
    } catch (error) {
        console.error('createVariant error:', error);
        res.status(500).json({ message: 'Error creating variant', error: error.message });
    }
};

// @desc    Bulk create variants from attribute combinations
// @route   POST /api/products/:productId/variants/bulk
// @access  Admin
export const bulkCreateVariants = async (req, res) => {
    try {
        const { productId } = req.params;
        const { attributeCombinations, basePrice, baseSku } = req.body;

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!attributeCombinations || !Array.isArray(attributeCombinations)) {
            return res.status(400).json({ message: 'attributeCombinations array is required' });
        }

        const createdVariants = [];
        const errors = [];

        for (const combo of attributeCombinations) {
            try {
                const { attributes, sku, price, stock, discountPrice, lowStockThreshold } = combo;

                // Generate SKU if not provided
                let variantSku = sku;
                if (!variantSku) {
                    const attrParts = Object.values(attributes).map(v => v.substring(0, 3).toUpperCase());
                    variantSku = `${baseSku || product.name.substring(0, 3).toUpperCase()}-${attrParts.join('-')}-${Date.now()}`.substring(0, 30);
                }

                // Check if SKU exists
                const existingSku = await ProductVariant.findOne({ sku: variantSku.toUpperCase() });
                if (existingSku) {
                    errors.push({ sku: variantSku, error: 'SKU already exists' });
                    continue;
                }

                const variant = new ProductVariant({
                    productId,
                    sku: variantSku.toUpperCase(),
                    attributes: attributes || {},
                    price: price || basePrice || product.basePrice,
                    discountPrice: discountPrice || null,
                    stock: stock || 0,
                    lowStockThreshold: lowStockThreshold || 10,
                    status: 'active'
                });

                await variant.save();

                // Create audit log
                await StockAudit.create({
                    variantId: variant._id,
                    action: 'added',
                    quantity: stock || 0,
                    previousStock: 0,
                    newStock: stock || 0,
                    reason: 'BULK_VARIANT_CREATED',
                    performedBy: req.user?._id || null,
                    notes: 'Bulk variant creation'
                });

                createdVariants.push(variant);
            } catch (err) {
                errors.push({ combo, error: err.message });
            }
        }

        // Set hasVariants flag if variants were created
        if (createdVariants.length > 0 && !product.hasVariants) {
            product.hasVariants = true;
            await product.save();
        }

        await syncProductStock(productId);

        res.status(201).json({
            success: true,
            message: `Created ${createdVariants.length} variants`,
            created: createdVariants.length,
            failed: errors.length,
            variants: createdVariants,
            errors
        });
    } catch (error) {
        console.error('bulkCreateVariants error:', error);
        res.status(500).json({ message: 'Error creating variants', error: error.message });
    }
};

// @desc    Get all variants for a product
// @route   GET /api/products/:productId/variants
// @access  Public
export const getVariantsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { status } = req.query;

        const filter = { productId };
        if (status) {
            filter.status = status;
        }

        const variants = await ProductVariant.find(filter).sort({ createdAt: 1 });

        res.json({
            success: true,
            count: variants.length,
            variants
        });
    } catch (error) {
        console.error('getVariantsByProduct error:', error);
        res.status(500).json({ message: 'Error fetching variants', error: error.message });
    }
};

// @desc    Get single variant by ID
// @route   GET /api/variants/:id
// @access  Public
export const getVariantById = async (req, res) => {
    try {
        const variant = await ProductVariant.findById(req.params.id).populate('productId', 'name description images');

        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        res.json({
            success: true,
            variant
        });
    } catch (error) {
        console.error('getVariantById error:', error);
        res.status(500).json({ message: 'Error fetching variant', error: error.message });
    }
};

// @desc    Update variant
// @route   PUT /api/variants/:id
// @access  Admin
export const updateVariant = async (req, res) => {
    try {
        const { sku, attributes, price, discountPrice, stock, lowStockThreshold, status, image } = req.body;

        const variant = await ProductVariant.findById(req.params.id);

        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        // If SKU is being changed, check for duplicates
        if (sku && sku.toUpperCase() !== variant.sku) {
            const existingSku = await ProductVariant.findOne({
                sku: sku.toUpperCase(),
                _id: { $ne: req.params.id }
            });

            if (existingSku) {
                return res.status(400).json({ message: 'SKU already exists' });
            }

            variant.sku = sku.toUpperCase();
        }

        // Track stock changes for audit
        const oldStock = variant.stock;

        if (attributes !== undefined) variant.attributes = attributes;
        if (price !== undefined) variant.price = price;
        if (discountPrice !== undefined) variant.discountPrice = discountPrice;
        if (stock !== undefined) variant.stock = stock;
        if (lowStockThreshold !== undefined) variant.lowStockThreshold = lowStockThreshold;
        if (status !== undefined) variant.status = status;
        if (image !== undefined) variant.image = image;

        await variant.save();
        await syncProductStock(variant.productId);

        // Create audit log if stock changed
        if (stock !== undefined && stock !== oldStock) {
            await StockAudit.create({
                variantId: variant._id,
                action: 'adjusted',
                quantity: Math.abs(stock - oldStock),
                previousStock: oldStock,
                newStock: stock,
                reason: 'ADMIN_UPDATE',
                performedBy: req.user?._id || null,
                notes: 'Manual stock adjustment via variant update'
            });
        }

        res.json({
            success: true,
            message: 'Variant updated successfully',
            variant
        });
    } catch (error) {
        console.error('updateVariant error:', error);
        res.status(500).json({ message: 'Error updating variant', error: error.message });
    }
};

// @desc    Update variant stock only
// @route   PATCH /api/variants/:id/stock
// @access  Admin
export const updateVariantStock = async (req, res) => {
    try {
        const { stock, reason, notes } = req.body;

        if (stock === undefined || stock < 0) {
            return res.status(400).json({ message: 'Valid stock value is required (>= 0)' });
        }

        const variant = await ProductVariant.findById(req.params.id);

        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        const oldStock = variant.stock;
        variant.stock = stock;
        await variant.save();
        await syncProductStock(variant.productId);

        // Create audit log
        await StockAudit.create({
            variantId: variant._id,
            action: stock > oldStock ? 'added' : 'deducted',
            quantity: Math.abs(stock - oldStock),
            previousStock: oldStock,
            newStock: stock,
            reason: reason || 'MANUAL_ADJUSTMENT',
            performedBy: req.user?._id || null,
            notes: notes || 'Stock adjustment'
        });

        res.json({
            success: true,
            message: 'Stock updated successfully',
            variant
        });
    } catch (error) {
        console.error('updateVariantStock error:', error);
        res.status(500).json({ message: 'Error updating stock', error: error.message });
    }
};

// @desc    Delete variant
// @route   DELETE /api/variants/:id
// @access  Admin
export const deleteVariant = async (req, res) => {
    try {
        const variant = await ProductVariant.findById(req.params.id);

        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        // TODO: Check if variant is in any active orders before deletion

        await variant.deleteOne();
        await syncProductStock(variant.productId);

        res.json({
            success: true,
            message: 'Variant deleted successfully'
        });
    } catch (error) {
        console.error('deleteVariant error:', error);
        res.status(500).json({ message: 'Error deleting variant', error: error.message });
    }
};

// @desc    Get low stock variants
// @route   GET /api/variants/low-stock
// @access  Admin
export const getLowStockVariants = async (req, res) => {
    try {
        // Find variants where stock <= lowStockThreshold
        const variants = await ProductVariant.find({
            $expr: { $lte: ['$stock', '$lowStockThreshold'] },
            status: { $ne: 'inactive' }
        })
            .populate('productId', 'name images')
            .sort({ stock: 1 });

        res.json({
            success: true,
            count: variants.length,
            variants
        });
    } catch (error) {
        console.error('getLowStockVariants error:', error);
        res.status(500).json({ message: 'Error fetching low stock variants', error: error.message });
    }
};

// @desc    Get variant stock audit history
// @route   GET /api/variants/:id/audit
// @access  Admin
export const getVariantAudit = async (req, res) => {
    try {
        const audits = await StockAudit.find({ variantId: req.params.id })
            .populate('performedBy', 'name email')
            .populate('orderId', 'orderId')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            count: audits.length,
            audits
        });
    } catch (error) {
        console.error('getVariantAudit error:', error);
        res.status(500).json({ message: 'Error fetching audit history', error: error.message });
    }
};
