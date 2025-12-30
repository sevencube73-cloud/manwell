import express from 'express';
const router = express.Router();
import {
    posSearchProducts,
    posSearchCustomers,
    posCreateOrder
} from '../controllers/posController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/products', protect, admin, posSearchProducts);
router.get('/customers', protect, admin, posSearchCustomers);
router.post('/orders', protect, admin, posCreateOrder);

export default router;
