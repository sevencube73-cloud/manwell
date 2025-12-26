import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    validateCart
} from '../controllers/cartController.js';

const router = express.Router();

// All cart routes require authentication
router.post('/', protect, addToCart);
router.get('/', protect, getCart);
router.put('/:itemId', protect, updateCartItem);
router.delete('/:itemId', protect, removeCartItem);
router.delete('/', protect, clearCart);

router.post('/validate', protect, validateCart);

export default router;
