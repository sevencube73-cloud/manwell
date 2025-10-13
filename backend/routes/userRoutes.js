import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getCustomers,
  deactivateCustomer,
  deleteCustomer,
  verifyCustomerByAdmin,
  activateCustomer,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/customers', protect, admin, getCustomers);
router.put('/customers/:id/deactivate', protect, admin, deactivateCustomer);
router.put('/customers/:id/activate', protect, admin, activateCustomer);
router.put('/customers/:id/verify', protect, admin, verifyCustomerByAdmin);
router.delete('/customers/:id', protect, admin, deleteCustomer);

export default router;
