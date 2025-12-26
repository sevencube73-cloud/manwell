/**
 * Data Migration Script: Products to Variants
 * 
 * This script migrates existing products to the new variant system.
 * 
 * For each existing product:
 * 1. Update product.price to product.basePrice
 * 2. Create a default variant with existing stock
 * 3. Generate a unique SKU
 * 4. Set hasVariants = false for simple products (or true if you want all products to use variants)
 * 
 * IMPORTANT: Backup your database before running this script!
 * 
 * Run with: node backend/scripts/migrateToVariants.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/product.js';
import ProductVariant from '../models/ProductVariant.js';
import StockAudit from '../models/StockAudit.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for migration');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const generateSKU = (productName, index) => {
    // Generate SKU from product name + timestamp + index
    const prefix = productName
        .substring(0, 4)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const suffix = index.toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${suffix}`;
};

const migrateProducts = async () => {
    try {
        console.log('\n🚀 Starting product migration to variant system...\n');

        // Find all products
        const products = await Product.find({});

        if (products.length === 0) {
            console.log('⚠️  No products found to migrate');
            return;
        }

        console.log(`Found ${products.length} products to migrate\n`);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let index = 0; index < products.length; index++) {
            const product = products[index];

            try {
                console.log(`[${index + 1}/${products.length}] Migrating: ${product.name}`);

                // Step 1: Update product schema fields
                const updateData = {};

                // Rename price to basePrice
                if (product.price !== undefined) {
                    updateData.basePrice = product.price;
                    updateData.$unset = { price: 1 };
                }

                // Remove stock field (now handled by variants)
                if (product.stock !== undefined) {
                    if (!updateData.$unset) updateData.$unset = {};
                    updateData.$unset.stock = 1;
                }

                // Set default values for new fields
                updateData.hasVariants = true; // Set to false if you want simple products
                updateData.status = product.status || 'active';
                updateData.brand = product.brand || '';
                updateData.tags = product.tags || [];

                await Product.updateOne({ _id: product._id }, updateData);

                // Step 2: Create default variant
                const sku = generateSKU(product.name, index);

                // Check if variant already exists for this product
                const existingVariant = await ProductVariant.findOne({
                    productId: product._id
                });

                if (!existingVariant) {
                    const variant = new ProductVariant({
                        productId: product._id,
                        sku: sku,
                        attributes: {}, // No attributes for default variant
                        price: product.price || 0,
                        discountPrice: null,
                        stock: product.stock || 0,
                        lowStockThreshold: 10,
                        image: product.images?.[0] || null,
                        status: (product.stock || 0) > 0 ? 'active' : 'out_of_stock'
                    });

                    await variant.save();

                    // Create audit log
                    await StockAudit.create({
                        variantId: variant._id,
                        action: 'added',
                        quantity: product.stock || 0,
                        previousStock: 0,
                        newStock: product.stock || 0,
                        reason: 'MIGRATION_DEFAULT_VARIANT',
                        performedBy: null,
                        notes: `Migrated from product ${product.name}`
                    });

                    console.log(`  ✅ Created default variant (SKU: ${sku}, Stock: ${product.stock || 0})`);
                } else {
                    console.log(`  ⚠️  Variant already exists, skipping variant creation`);
                }

                successCount++;
            } catch (error) {
                errorCount++;
                errors.push({ productName: product.name, error: error.message });
                console.log(`  ❌ Error: ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(60));
        console.log(`Total Products: ${products.length}`);
        console.log(`✅ Successfully Migrated: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);

        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            errors.forEach(err => {
                console.log(`  - ${err.productName}: ${err.error}`);
            });
        }

        console.log('\n✅ Migration completed!\n');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

const main = async () => {
    await connectDB();

    console.log('⚠️  IMPORTANT: This will modify your database!');
    console.log('⚠️  Make sure you have a backup before proceeding.\n');

    // Uncomment the line below to run the migration
    // await migrateProducts();

    // For safety, migration is commented out by default
    console.log('⚠️  Migration is currently disabled for safety.');
    console.log('⚠️  Uncomment the line in the script to run the migration.\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
};

main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
