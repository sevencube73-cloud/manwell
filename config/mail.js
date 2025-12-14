import nodemailer from "nodemailer";

/**
 * Brevo SMTP Transporter Configuration
 * Uses environment variables for secure credential management
 * 
 * Required environment variables:
 * - SMTP_HOST: smtp-relay.brevo.com
 * - SMTP_PORT: 587
 * - SMTP_USER: Your Brevo SMTP login email
 * - SMTP_PASS: Your Brevo SMTP API key (NOT your Brevo password)
 * - FROM_EMAIL: Your sender email address
 */
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // MUST be false for Brevo port 587
  // timeouts to fail fast when SMTP is blocked or unreachable
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT) || 10000,
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT) || 10000,
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT) || 10000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
