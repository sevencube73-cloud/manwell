import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', getAdminStats);
router.get('/dashboard-data', getAdminStats); // Add dashboard-data route for frontend

export default router;