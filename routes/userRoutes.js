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
  makeUserAdmin,
  revokeUserAdmin,
  getSavedAddresses,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  getStaffs,
  makeUserStaff,
  revokeUserStaff,
} from '../controllers/userController.js';
import { verifyOtp, resendOtp } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
// OTP endpoints (forwarded to auth controller)
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Shipping Addresses (protected)
router.get('/addresses', protect, getSavedAddresses);
router.post('/addresses', protect, addSavedAddress);
router.put('/addresses/:addressId', protect, updateSavedAddress);
router.delete('/addresses/:addressId', protect, deleteSavedAddress);
router.put('/addresses/:addressId/set-default', protect, setDefaultAddress);

// Admin routes
router.get('/customers', protect, admin, getCustomers);
router.put('/customers/:id/deactivate', protect, admin, deactivateCustomer);
router.put('/customers/:id/activate', protect, admin, activateCustomer);
router.put('/customers/:id/verify', protect, admin, verifyCustomerByAdmin);
router.delete('/customers/:id', protect, admin, deleteCustomer);
router.put('/:id/make-admin', protect, admin, makeUserAdmin);
router.put('/:id/revoke-admin', protect, admin, revokeUserAdmin);
router.get('/staffs', protect, admin, getStaffs);
router.put('/:id/make-staff', protect, admin, makeUserStaff);
router.put('/:id/revoke-staff', protect, admin, revokeUserStaff);

export default router;
