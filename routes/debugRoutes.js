import express from "express";
import { sendTestEmail, verifySmtp, getEmailConfig } from "../controllers/debugController.js";

const router = express.Router();

// POST /api/debug/test-email
router.post("/test-email", sendTestEmail);

// GET /api/debug/verify-smtp
router.get("/verify-smtp", verifySmtp);

// GET /api/debug/config
router.get("/config", getEmailConfig);

export default router;
