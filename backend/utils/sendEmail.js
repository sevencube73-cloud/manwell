import createTransporter from '../config/email.js';

const sendEmail = async ({ email, subject, message }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"MANWELL STORE" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html: message,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;