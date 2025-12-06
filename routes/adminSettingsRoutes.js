import express from 'express';
import { getSettings, updateSettings } from '../controllers/adminSettingsController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public read
router.get('/', getSettings);

// Update - admin only
router.put('/', protect, isAdmin, updateSettings);

export default router;
