import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

// ✅ Register new user
export const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already registered" });

    await User.create({
      name,
      email,
      password,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Account registered successfully. Please login.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ✅ Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ✅ Request password reset (modern email template)
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 30 * 60 * 1000; // 30 mins expiry
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // ✅ Modern Company-style HTML email
    const html = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #007bff, #00c6ff); padding: 25px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 22px;">🔐 Password Reset Request</h1>
          </div>

          <!-- Body -->
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hello <b>${user.name || "User"}</b>,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to set up a new password for your account.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                style="background: linear-gradient(135deg, #007bff, #00c6ff); color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 600;">
                Reset Password
              </a>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If you didn’t request this password reset, you can safely ignore this email.
              The link will expire in <b>30 minutes</b> for your security.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

            <p style="font-size: 13px; color: #999;">
              Need help? Contact our support team anytime at 
              <a href="mailto:support@manwellstore.com" style="color: #007bff; text-decoration: none;">support@manwellstore.com</a>.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f0f2f5; padding: 20px; text-align: center;">
            <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Follow us on</p>
            <div style="margin-bottom: 10px;">
              <a href="https://facebook.com" style="margin: 0 8px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" alt="Facebook" />
              </a>
              <a href="https://twitter.com" style="margin: 0 8px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="24" alt="Twitter" />
              </a>
              <a href="https://instagram.com" style="margin: 0 8px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" alt="Instagram" />
              </a>
              <a href="https://linkedin.com" style="margin: 0 8px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="24" alt="LinkedIn" />
              </a>
            </div>

            <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} Manwell Store. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail(user.email, "Password Reset Request", html);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send reset email",
      error: error.message,
    });
  }
};

// ✅ Reset password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Password reset failed",
      error: error.message,
    });
  }
};
