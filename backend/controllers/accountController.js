import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const CLIENT_URL = process.env.CLIENT_URL;

// ✅ Helper: Send Email using Resend
const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", response.id);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

// ✅ Request Password Reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found." });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token and expiration
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    const message = `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name || "there"},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `;

    await sendEmail(user.email, "Password Reset Request", message);

    res.status(200).json({
      message: "Reset email sent! Check your inbox.",
    });
  } catch (error) {
    console.error("Password reset email error:", error);
    res.status(500).json({ message: "Error sending reset email." });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Hash token to match DB
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token." });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password." });
  }
};
