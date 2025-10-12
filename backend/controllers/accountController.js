import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// ✅ Reusable email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  pool: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// ✅ Send activation email to user
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

    const activationLink = `https://manwellfrontend-6scg.onrender.com/activate-account?token=${token}`;

    await transporter.sendMail({
      from: `"Manwell Support" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Activate Your Account',
      html: `
        <p>Hello ${user.name || 'User'},</p>
        <p>Click below to activate your account:</p>
        <p><a href="${activationLink}" target="_blank">${activationLink}</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({ message: 'Activation email sent successfully.' });
  } catch (error) {
    console.error('Activation email error:', error);
    res.status(500).json({ message: 'Error sending activation email', error: error.message });
  }
};

// ✅ Activate account via email verification link
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

// ✅ Change password (user must be logged in)
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

// ✅ Request password reset (send email)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    await user.save();

    const resetLink = `https://manwellfrontend-6scg.onrender.com/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Manwell Support" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${user.name || 'User'},</p>
        <p>We received a request to reset your password.</p>
        <p><a href="${resetLink}" target="_blank">Click here to reset your password</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Password reset email error:', error);
    res.status(500).json({ message: 'Error sending reset email', error: error.message });
  }
};

// ✅ Reset password (using token)
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: 'Token and new password required' });

    const user = await User.findOne({ verificationToken: token });
    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = newPassword;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// ✅ Activate account (admin only)
export const activateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = true;
    await user.save();
    res.json({ message: 'Account activated successfully by admin.' });
  } catch (error) {
    res.status(500).json({ message: 'Error activating account', error: error.message });
  }
};
