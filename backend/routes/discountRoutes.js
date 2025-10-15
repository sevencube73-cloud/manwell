import express from 'express';
import {
  createDiscount,
  getAllDiscounts,
  getActiveDiscounts,
  updateDiscount,
  deleteDiscount,
} from '../controllers/discountController.js';

const router = express.Router();

// Admin routes
router.post('/', createDiscount);
router.get('/', getAllDiscounts);
router.put('/:id', updateDiscount);
router.delete('/:id', deleteDiscount);

// Public route — fetch active discounts
router.get('/active/list', getActiveDiscounts);

export default router;
