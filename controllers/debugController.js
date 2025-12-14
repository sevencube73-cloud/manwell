import sendEmail from "../utils/sendEmail.js";

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

export default sendTestEmail;
