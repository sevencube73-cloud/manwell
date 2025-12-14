/**
 * OTP email template for email verification
 * @param {string} name - User's name
 * @param {string} otp - One-time password (5 digits)
 * @returns {string} HTML email content
 */
export const otpEmailTemplate = (name, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 25px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 22px;">🔐 Your Verification Code</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #333;">
          <p style="font-size: 16px;">Hello <b>${name || "User"}</b>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            Use the following 5-digit code to verify your email address. This code will expire in 10 minutes.
          </p>

          <!-- OTP Display Box -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 20px 30px; background: #f1f5f9; border-radius: 8px; border: 2px solid #28a745;">
              <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Your Code</p>
              <p style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #28a745;">${otp}</p>
            </div>
          </div>

          <!-- Security Notice -->
          <div style="background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0; font-size: 14px; color: #1b5e20;">
              <b>🔒 Security:</b> Never share this code with anyone. Manwell staff will never ask for your verification code.
            </p>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            ⏱️ This code expires in <b>10 minutes</b> for your security. If you didn't request this code, you can ignore this email.
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
