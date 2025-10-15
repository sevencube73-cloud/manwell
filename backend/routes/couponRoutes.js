import express from 'express';
import {
  createDiscount,
  getAllDiscounts,
  updateDiscount,
  deleteDiscount,
  applyDiscount,
} from '../controllers/discountController.js';

const router = express.Router();

// Admin routes
router.post('/discount', createDiscount);
router.get('/discounts', getAllDiscounts);
router.put('/discount/:id', updateDiscount);
router.delete('/discount/:id', deleteDiscount);

// Public route — apply discount
router.post('/apply', applyDiscount);

export default router;
