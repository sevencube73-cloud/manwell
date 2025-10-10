import createTransporter from '../config/email.js';

const sendEmail = async ({ email, subject, message }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"E-Commerce App" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html: message,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;