// utils/sendEmail.js
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, verificationLink) => {
  try {
    await resend.emails.send({
      from: "Manwell <onboarding@resend.dev>",
      to: email,
      subject: "Verify your account - Manwell",
      html: `
        <div style="font-family:sans-serif; padding:20px; line-height:1.6">
          <h2>Welcome to Manwell!</h2>
          <p>Click the link below to verify your account:</p>
          <a href="${verificationLink}" style="color:#1a73e8; font-weight:bold;">Verify Account</a>
          <br /><br />
          <p>If you didn’t create this account, you can ignore this email.</p>
        </div>
      `,
    });
    console.log("✅ Verification email sent to:", email);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
  }
};
