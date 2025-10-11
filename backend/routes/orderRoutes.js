import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new order
router.post('/', protect, createOrder);

// Get orders of logged-in user
router.get('/myorders', protect, getMyOrders);

// Get all orders (admin)
router.get('/', protect, admin, getAllOrders);

// Get single order by ID (admin)
router.get('/:id', protect, admin, getOrderById);

// Update order status (admin)
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
