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
import { transporter } from "../config/mail.js";

const BREVO_API_URL = process.env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email";

export const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Missing required email fields: to, subject, html");
  }

  // ⚠️ CRITICAL: FROM_EMAIL must be set and verified in Brevo
  const fromAddress = process.env.FROM_EMAIL;
  if (!fromAddress) {
    console.error('❌ CRITICAL: FROM_EMAIL not set. Set FROM_EMAIL in environment variables.');
    throw new Error("FROM_EMAIL environment variable is required");
  }

  const mailOptions = {
    from: `"Manwell Store" <${fromAddress}>`,
    to,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, "")
  };

  // Log available providers for debugging
  const smtpUserSet = !!process.env.SMTP_USER;
  const smtpPassSet = !!process.env.SMTP_PASS;
  const apiKeySet = !!process.env.BREVO_API_KEY;
  console.log(`📧 Email dispatch: to=${to} | from=${fromAddress} | SMTP=${smtpUserSet && smtpPassSet ? "✅" : "❌"} | API=${apiKeySet ? "✅" : "❌"}`);

  // First attempt: SMTP via Nodemailer (if configured)
  if (smtpUserSet && smtpPassSet) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ SMTP email sent to ${to} | Subject: "${subject}" | MessageID: ${info.messageId}`);
      return { provider: "smtp", info };
    } catch (smtpError) {
      console.warn(`⚠️ SMTP send failed for ${to}: ${smtpError.message || smtpError}`);
    }
  }

  // Second attempt: Brevo API (primary for most environments)
  const apiKey = process.env.BREVO_API_KEY;
  if (apiKey) {
    try {
      // Brevo API v3 expects exact structure
      const payload = {
        sender: { 
          name: "Manwell Store", 
          email: fromAddress 
        },
        to: [{ 
          email: to,
          name: to.split('@')[0] // Use email prefix as fallback name
        }],
        subject,
        htmlContent: html,
        textContent: mailOptions.text,
        replyTo: { 
          email: fromAddress,
          name: "Manwell Store"
        }
      };

      console.log(`📤 Attempting Brevo API with sender: ${fromAddress}`);
      
      const res = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(`❌ Brevo API error ${res.status}: ${JSON.stringify(data)}`);
        throw new Error(`Brevo API responded ${res.status}: ${data.message || data.error || 'Unknown error'}`);
      }

      console.log(`✅ Brevo API email sent to ${to} | Subject: "${subject}" | id: ${data.messageId || 'n/a'}`);
      return { provider: "brevo-api", info: data };
      } catch (apiErr) {
        console.error(`❌ Brevo API attempt failed for ${to}:`, apiErr.message || apiErr);
      }
    }

    // No API key available either
    throw new Error(`Email delivery failed: SMTP timeout and no Brevo API key configured. Set BREVO_API_KEY environment variable.`);
  }
};
