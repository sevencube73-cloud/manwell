import { sendEmail } from "../utils/sendEmail.js";
import { transporter } from "../config/mail.js";

export const sendTestEmail = async (req, res) => {
  const to = req.body.to || process.env.DEV_TEST_EMAIL;
  if (!to) {
    return res.status(400).json({ message: 'Provide `to` in body or set DEV_TEST_EMAIL' });
  }

  const subject = req.body.subject || "Manwell Backend: Test Email";
  const html = req.body.html || `<p>This is a test email from Manwell backend at ${new Date().toISOString()}</p>`;

  try {
    await sendEmail({ to, subject, html });
    return res.json({ success: true, message: `Email sent to ${to}` });
  } catch (error) {
    console.error("❌ Test email failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const verifySmtp = async (req, res) => {
  try {
    await transporter.verify();
    return res.json({ ok: true, message: "SMTP transporter verified successfully" });
  } catch (err) {
    console.error("SMTP verify failed:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

export const getEmailConfig = async (req, res) => {
  const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_HOST);
  const brevoApiConfigured = !!process.env.BREVO_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "not-set";

  return res.json({
    smtp: {
      configured: smtpConfigured,
      host: smtpConfigured ? process.env.SMTP_HOST : "not-set",
      port: smtpConfigured ? process.env.SMTP_PORT || "587" : "not-set",
      user: smtpConfigured ? "***" : "not-set",
      pass: smtpConfigured ? "***" : "not-set",
    },
    brevoApi: {
      configured: brevoApiConfigured,
      apiKey: brevoApiConfigured ? "***" : "not-set",
    },
    fromEmail,
    summary: smtpConfigured || brevoApiConfigured ? "✅ At least one email provider configured" : "❌ No email providers configured",
  });
};

export default sendTestEmail;
