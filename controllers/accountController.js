import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * 🔹 Change user password (logged-in user)
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Old and New Password required." });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password incorrect." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Error changing password." });
  }
};

/**
 * 🔹 Request password reset (send reset email)
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found." });

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #dc3545, #ff6b6b); padding: 25px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 22px;">🔐 Password Reset Request</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              You requested to reset your password. Click the button below to set up a new password for your account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                style="background: linear-gradient(135deg, #dc3545, #ff6b6b); color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 600;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">If you didn't request this password reset, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html
    });

    res.status(200).json({ message: "Password reset email sent!" });
  } catch (error) {
    console.error("Password reset email error:", error);
    res.status(500).json({ message: "Failed to send reset email." });
  }
};

/**
 * 🔹 Reset password using token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "Token and new password required." });

    const user = await User.findOne({ verificationToken: token });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token." });

    user.password = await bcrypt.hash(newPassword, 10);
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password." });
  }
};

/**
 * 🔹 Send account activation email
 */
export const sendActivationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found." });
    if (user.isActive)
      return res.status(400).json({ message: "Account already active." });

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    await user.save();

    const activationLink = `${process.env.CLIENT_URL}/activate-account?token=${token}`;

    const html = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 25px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 22px;">🎉 Welcome to Manwell!</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              Click the button below to activate your account and get started with Manwell.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationLink}" 
                style="background: linear-gradient(135deg, #28a745, #20c997); color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 600;">
                Activate Account
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">Welcome aboard! We're excited to have you join Manwell Store.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Activate Your Manwell Account",
      html
    });

    res.status(200).json({ message: "Activation email sent!" });
  } catch (error) {
    console.error("Activation email error:", error);
    res.status(500).json({ message: "Failed to send activation email." });
  }
};

/**
 * 🔹 Activate account using token
 */
export const activateAccountByToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ message: "Token required." });

    const user = await User.findOne({ verificationToken: token });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token." });

    user.isActive = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Account activated successfully!" });
  } catch (error) {
    console.error("Account activation error:", error);
    res.status(500).json({ message: "Error activating account." });
  }
};

/**
 * 🔹 Admin manual activation (fallback)
 */
export const activateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found." });

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: "Account activated successfully by admin!" });
  } catch (error) {
    console.error("Admin activation error:", error);
    res.status(500).json({ message: "Error activating account." });
  }
};
