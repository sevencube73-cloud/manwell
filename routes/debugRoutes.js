import express from "express";
import { sendTestEmail } from "../controllers/debugController.js";

const router = express.Router();

// POST /api/debug/test-email
router.post("/test-email", sendTestEmail);

export default router;
