import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import parser from '../middleware/upload.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin - create/update/delete products (with up to 3 images)
router.post('/', protect, admin, parser.array('images', 3), createProduct);
router.put('/:id', protect, admin, parser.array('images', 3), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;