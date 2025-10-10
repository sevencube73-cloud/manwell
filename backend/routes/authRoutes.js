import express from 'express';
import { registerUser, loginUser, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);

export default router;