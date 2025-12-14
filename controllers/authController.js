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

    // Create user (email not verified by default)
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      address,
      isEmailVerified: false,
    });

    // Generate 5-digit numeric OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    newUser.emailOTP = otp;
    newUser.emailOTPExpire = otpExpire;
    await newUser.save();

    // Send OTP email
    const html = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 25px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 22px;">Your Manwell verification code</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hello <b>${name || 'User'}</b>,</p>
            <p style="font-size: 15px; line-height: 1.6;">Use the following 5-digit code to verify your email address. This code will expire in 10 minutes.</p>
            <div style="text-align:center; margin: 20px 0;">
              <div style="display:inline-block; padding: 18px 28px; background:#f1f5f9; border-radius:8px; font-size:22px; font-weight:700; letter-spacing:6px;">${otp}</div>
            </div>
            <p style="font-size: 13px; color: #666;">If you did not create this account, you can ignore this message.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} Manwell Store</p>
          </div>
        </div>
      </div>
    `;

    let emailSent = true;
    let emailProvider = "unknown";
    try {
      const result = await sendEmail({ to: email, subject: 'Your Manwell verification code', html });
      emailProvider = result.provider || "unknown";
    } catch (emailError) {
      emailSent = false;
      console.error('Failed to send OTP email for user:', email, emailError.message || emailError);
    }

    return res.status(201).json({
      success: true,
      message: emailSent ? 'Account created. A verification code has been sent to your email.' : 'Account created but failed to send verification email. Please contact support.',
      requiresOtp: true,
      email: newUser.email,
      resendAvailable: !emailSent,
      emailProvider: emailSent ? emailProvider : null,
      debugInfo: emailSent ? null : {
        smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_HOST),
        brevoApiConfigured: !!process.env.BREVO_API_KEY,
        hint: "Check /api/debug/config for email configuration status"
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Registration failed',
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
    
    // Block login if email not verified (handle old records without the field)
    // For local auth users: require verification
    // For Google auth: auto-verified, so skip check
    if (user.authProvider !== 'google' && !user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your email before logging in.",
        resendVerification: true,
        resendEndpoint: "/api/auth/resend-verification-email",
      });
    }

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
              <a href="mailto:manwellstore@gmail.com" style="color: #007bff; text-decoration: none;">manwellstore@gmail.com</a>.
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

    await sendEmail({ to: user.email, subject: "Password Reset Request", html });

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

// ✅ Verify email
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired verification token" 
      });

    // Mark email as verified
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};

// GET handler for email links: verify then redirect user to frontend
export const verifyEmailRedirect = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() },
    });

    const clientBase = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!user) {
      // Redirect to frontend with error query
      const redirectUrl = `${clientBase}/verify-email?status=error&message=invalid_token`;
      return res.redirect(redirectUrl);
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    // Redirect to frontend login with success flag
    const redirectUrl = `${clientBase}/login?verified=1`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in verifyEmailRedirect:', error);
    const clientBase = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${clientBase}/verify-email?status=error&message=server_error`);
  }
};

// ✅ Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.emailOTP || !user.emailOTPExpire)
      return res.status(400).json({ message: 'No OTP found for this user' });

    if (user.emailOTPExpire < Date.now())
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    if (user.emailOTP !== String(otp).trim())
      return res.status(400).json({ message: 'Invalid OTP code' });

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpire = undefined;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// ✅ Resend OTP
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    // Generate new OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.emailOTP = otp;
    user.emailOTPExpire = otpExpire;
    await user.save();

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px;">
        <p>Hello <b>${user.name || 'User'}</b>,</p>
        <p>Your new verification code is:</p>
        <div style="font-size: 20px; font-weight:700; background:#f3f4f6; display:inline-block; padding:10px 18px; border-radius:6px">${otp}</div>
        <p style="color:#666; margin-top:12px;">This code expires in 10 minutes.</p>
      </div>
    `;

    await sendEmail({ to: user.email, subject: 'Your Manwell verification code', html });

    res.json({ success: true, message: 'OTP resent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};

// ✅ Resend verification email
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email is already verified" });

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpire = verificationTokenExpire;
    await user.save();

    // Send verification email -> point to backend verify endpoint
    const backendBase = process.env.SERVER_URL || process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
    const verificationUrl = `${backendBase}/api/auth/verify-email/${verificationToken}`;

    const html = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 25px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 22px;">✉️ Verify Your Email</h1>
          </div>

          <!-- Body -->
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hello <b>${user.name || "User"}</b>,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              Here's your new verification link. Please click the button below to verify your email address.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                style="background: linear-gradient(135deg, #28a745, #20c997); color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 600;">
                Verify Email Address
              </a>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Or copy and paste this link in your browser:<br>
              <a href="${verificationUrl}" style="color: #007bff; text-decoration: none; word-break: break-all;">${verificationUrl}</a>
            </p>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              This link will expire in <b>24 hours</b> for your security.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

            <p style="font-size: 13px; color: #999;">
              Need help? Contact our support team at 
              <a href="mailto:manwellstore@gmail.com" style="color: #007bff; text-decoration: none;">manwellstore@gmail.com</a>.
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

    await sendEmail({ to: email, subject: "Verify Your Email Address", html });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send verification email",
      error: error.message,
    });
  }
};

// ✅ Google OAuth Callback Handler
export const googleAuthCallback = async (req, res) => {
  try {
    const { id, email, displayName, photos } = req.user;

    // Check if user already exists
    let user = await User.findOne({ googleId: id });

    if (!user) {
      // Create new user from Google profile
      user = await User.create({
        name: displayName || email.split("@")[0],
        email,
        googleId: id,
        authProvider: "google",
        profilePicture: photos?.[0]?.value || null,
        isEmailVerified: true, // Google accounts are automatically verified
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token
    const frontendUrl = `${process.env.CLIENT_URL}/auth-success?token=${token}&email=${user.email}&name=${user.name}`;
    res.redirect(frontendUrl);
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
  }
};

// ✅ Check if user exists with Google ID
export const getGoogleUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findOne({ googleId: req.user.id });
    res.json({ success: true, user, authenticated: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Link Google account to existing user (optional)
export const linkGoogleAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { googleId, email, displayName, profilePicture } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.googleId) {
      return res.status(400).json({ message: "Google account already linked" });
    }

    user.googleId = googleId;
    user.authProvider = "both";
    user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      message: "Google account linked successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to link Google account",
      error: error.message,
    });
  }
};
