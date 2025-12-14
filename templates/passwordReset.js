/**
 * Password reset email template
 * @param {string} name - User's name
 * @param {string} resetUrl - Password reset URL
 * @returns {string} HTML email content
 */
export const passwordResetTemplate = (name, resetUrl) => {
  return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc3545, #ff6b6b); padding: 25px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 22px;">🔐 Password Reset Request</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #333;">
          <p style="font-size: 16px;">Hello <b>${name || "User"}</b>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set up a new password for your account.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
              style="background: linear-gradient(135deg, #dc3545, #ff6b6b); color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Reset Password
            </a>
          </div>

          <!-- Security Notice -->
          <div style="background: #ffe0e0; padding: 15px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #dc3545;">
            <p style="margin: 0; font-size: 14px; color: #721c24;">
              <b>⚠️ Security Notice:</b> This link will expire in <b>30 minutes</b>. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            Or copy and paste this link in your browser:<br>
            <a href="${resetUrl}" style="color: #007bff; text-decoration: none; word-break: break-all; font-size: 12px;">${resetUrl}</a>
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 13px; color: #999;">
            Need help? Contact our support team at 
            <a href="mailto:manwellstore@gmail.com" style="color: #007bff; text-decoration: none;">manwellstore@gmail.com</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f2f5; padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Follow us on social media</p>
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
          </div>
          <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} Manwell Store. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};
