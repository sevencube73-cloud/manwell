import express from "express";
import { sendTestEmail, verifySmtp } from "../controllers/debugController.js";

const router = express.Router();

// POST /api/debug/test-email
router.post("/test-email", sendTestEmail);

// GET /api/debug/verify-smtp
router.get("/verify-smtp", verifySmtp);

export default router;
