import express from 'express';
const router = express.Router();
import {
  createFlashSale,
  getFlashSales,
  getFlashSaleById,
  updateFlashSale,
  deleteFlashSale,
} from '../controllers/flashSaleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, admin, createFlashSale).get(protect, admin, getFlashSales);
router
  .route('/:id')
  .get(protect, admin, getFlashSaleById)
  .put(protect, admin, updateFlashSale)
  .delete(protect, admin, deleteFlashSale);

export default router;
