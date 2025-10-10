import express from 'express';
import { getUserProfile, updateUserProfile, getCustomers, deactivateCustomer, deleteCustomer, verifyCustomerByAdmin, activateCustomer } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.get('/customers', protect, admin, getCustomers);
// Deactivate a customer (admin only)
router.put('/customers/:id/deactivate', protect, admin, deactivateCustomer);
// Activate a customer (admin only)
router.put('/customers/:id/activate', protect, admin, activateCustomer);
// Delete a customer (admin only)
router.delete('/customers/:id', protect, admin, deleteCustomer);
// Verify a customer (admin only)
router.put('/customers/:id/verify', protect, admin, verifyCustomerByAdmin);

export default router;