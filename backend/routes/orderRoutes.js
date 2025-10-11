import express from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getAllOrders, 
  updateOrderStatus, 
  getOrderById 
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create order
router.post('/', protect, createOrder);

// Get user's orders
router.get('/myorders', protect, getMyOrders);

// Admin: get all orders
router.get('/', protect, admin, getAllOrders);

// Admin: get order by ID
router.get('/:id', protect, admin, getOrderById);

// Admin: update order status
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
