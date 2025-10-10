// Send activation email to user
export const sendActivationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isActive) return res.status(400).json({ message: 'Account is already active' });
    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    await user.save();
    // Send activation email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Activate Your Account',
      text: `Activate your account: http://localhost:3000/activate-account?token=${token}`
    });
    res.json({ message: 'Activation email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending activation email', error: error.message });
  }
};

// Activate account via email verification link
export const activateAccountByToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.isActive = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Account activated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error activating account', error: error.message });
  }
};
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Change password (user must be logged in)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new password required' });
    }
    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ message: 'Old password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

// Request password reset (send email)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    await user.save();
    // Send email using SMTP config from .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Password Reset',
      text: `Reset your password: http://localhost:3000/reset-password?token=${token}`
    });
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset email', error: error.message });
  }
};

// Reset password (using token)
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password required' });
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = newPassword;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// Activate account (admin only)
export const activateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = true;
    await user.save();
    res.json({ message: 'Account activated' });
  } catch (error) {
    res.status(500).json({ message: 'Error activating account', error: error.message });
  }
};
