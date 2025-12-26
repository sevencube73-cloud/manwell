import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    createVariant,
    bulkCreateVariants,
    getVariantsByProduct,
    getVariantById,
    updateVariant,
    updateVariantStock,
    deleteVariant,
    getLowStockVariants,
    getVariantAudit
} from '../controllers/productVariantController.js';

const router = express.Router();

// Low stock alerts (admin only) - must be before :id route
router.get('/low-stock', protect, admin, getLowStockVariants);

// Variant-specific routes (public can view, admin can modify)
router.get('/:id', getVariantById);
router.put('/:id', protect, admin, updateVariant);
router.patch('/:id/stock', protect, admin, updateVariantStock);
router.delete('/:id', protect, admin, deleteVariant);
router.get('/:id/audit', protect, admin, getVariantAudit);

export default router;
