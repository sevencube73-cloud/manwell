import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email not sent");
  }
};

export default sendEmail; // ✅ important
