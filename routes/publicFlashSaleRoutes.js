import express from 'express';
const router = express.Router();
import {
  getActiveFlashSales,
} from '../controllers/flashSaleController.js';

router.route('/active').get(getActiveFlashSales);

export default router;
