import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from './utils/sendEmail.js';

const to = process.env.TEST_EMAIL || process.env.FROM_EMAIL;
if (!to) {
  console.error('Please set TEST_EMAIL or FROM_EMAIL in your environment to receive the test email.');
  process.exit(1);
}

const html = `<h3>Brevo SMTP Test</h3><p>If you received this, Brevo SMTP is working.</p>`;

try {
  const info = await sendEmail({ to, subject: 'Brevo SMTP Test', html });
  console.log('Test email sent:', info.messageId || info);
  process.exit(0);
} catch (err) {
  console.error('Failed to send test email:', err.message || err);
  process.exit(1);
}
