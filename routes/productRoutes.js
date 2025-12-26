import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from '../controllers/productController.js';
import { createVariant, bulkCreateVariants, getVariantsByProduct } from '../controllers/productVariantController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import parser from '../middleware/upload.js';

const router = express.Router();

import Product from "../models/product.js";


// Get the latest added product
router.get("/latest", async (req, res) => {
  try {
    const latestProduct = await Product.findOne().sort({ createdAt: -1 });
    if (!latestProduct) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json(latestProduct);
  } catch (error) {
    console.error("Error fetching latest product:", error);
    res.status(500).json({ message: "Server error" });
  }
});





// Public
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin - create/update/delete products (with up to 3 images)
router.post('/', protect, admin, parser.array('images', 3), createProduct);
router.put('/:id', protect, admin, parser.array('images', 3), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// 🔥 Product Variant Routes
router.post('/:productId/variants', protect, admin, createVariant);
router.post('/:productId/variants/bulk', protect, admin, bulkCreateVariants);
router.get('/:productId/variants', getVariantsByProduct);

export default router;