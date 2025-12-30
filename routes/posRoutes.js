import express from 'express';
const router = express.Router();
import {
    posSearchProducts,
    posSearchCustomers,
    posCreateOrder
} from '../controllers/posController.js';
import { protect, admin, staffOrAdmin } from '../middleware/authMiddleware.js';

router.get('/products', protect, staffOrAdmin, posSearchProducts);
router.get('/customers', protect, staffOrAdmin, posSearchCustomers);
router.post('/orders', protect, staffOrAdmin, posCreateOrder);

export default router;
