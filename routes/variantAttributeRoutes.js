import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    createAttribute,
    getAllAttributes,
    getAttributeById,
    updateAttribute,
    deleteAttribute,
    addAttributeValue,
    removeAttributeValue
} from '../controllers/variantAttributeController.js';

const router = express.Router();

// Public routes
router.get('/', getAllAttributes);
router.get('/:id', getAttributeById);

// Admin routes
router.post('/', protect, admin, createAttribute);
router.put('/:id', protect, admin, updateAttribute);
router.delete('/:id', protect, admin, deleteAttribute);

router.post('/:id/values', protect, admin, addAttributeValue);
router.delete('/:id/values/:value', protect, admin, removeAttributeValue);

export default router;
