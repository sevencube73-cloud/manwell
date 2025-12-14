/**
 * Send email using Brevo SMTP via Nodemailer
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML email content
 * @returns {Promise} Nodemailer send response
 * @throws {Error} If email fails to send
 * 
 * @example
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome to Manwell',
 *   html: '<h1>Welcome!</h1>'
 * });
 */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Missing required email fields: to, subject, html");
  }

  try {
    const info = await transporter.sendMail({
      from: `"Manwell Store" <${process.env.FROM_EMAIL || "no-reply@manwell.com"}>`,
      to,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, "") // Strip HTML tags for plain text fallback
    });

    console.log(`✅ Email sent to ${to} | Subject: "${subject}" | MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
