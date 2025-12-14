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

  // Prepare common mail options
  const fromAddress = process.env.FROM_EMAIL || "no-reply@manwell.com";
  const mailOptions = {
    from: `"Manwell Store" <${fromAddress}>`,
    to,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, "")
  };

  // First attempt: SMTP via Nodemailer
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ SMTP email sent to ${to} | Subject: "${subject}" | MessageID: ${info.messageId}`);
    return { provider: "smtp", info };
  } catch (smtpError) {
    console.warn(`⚠️ SMTP send failed for ${to}: ${smtpError.message || smtpError}`);

    // If Brevo API key available, attempt HTTP fallback (likely to work where SMTP egress is blocked)
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      try {
        const payload = {
          sender: { name: "Manwell Store", email: fromAddress },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: mailOptions.text
        };

        const res = await fetch(BREVO_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey
          },
          body: JSON.stringify(payload),
          // keep short timeout via AbortController if needed upstream
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`❌ Brevo API fallback failed: ${res.status} ${res.statusText} - ${body}`);
          throw new Error(`Brevo API responded ${res.status}`);
        }

        const data = await res.json();
        console.log(`✅ Brevo API email sent to ${to} | Subject: "${subject}" | id: ${data.messageId || data['messageId'] || 'n/a'}`);
        return { provider: "brevo-api", info: data };
      } catch (apiErr) {
        console.error(`❌ Brevo API fallback failed for ${to}:`, apiErr.message || apiErr);
        // throw combined error for visibility
        throw new Error(`SMTP error: ${smtpError.message}; Brevo API error: ${apiErr.message || apiErr}`);
      }
    }

    // No API key available or fallback not configured
    throw new Error(`SMTP send failed and no Brevo API fallback available: ${smtpError.message}`);
  }
};
