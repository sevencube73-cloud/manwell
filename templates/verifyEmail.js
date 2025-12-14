/**
 * Email verification template
 * @param {string} name - User's name
 * @param {string} token - Verification token
 * @param {string} appUrl - Application URL (e.g., https://yourapp.com)
 * @returns {string} HTML email content
 */
export const verifyEmailTemplate = (
  name,
  token,
  appUrl = process.env.APP_URL || "http://localhost:3000"
) => {
  const verificationUrl = `${appUrl}/verify-email?token=${token}`;

  return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 25px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 22px;">✉️ Verify Your Email</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #333;">
          <p style="font-size: 16px;">Hello <b>${name || "User"}</b>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            Welcome to Manwell Store! Please click the button below to verify your email address and complete your registration.
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
            If you did not create this account, you can safely ignore this email.
          </p>
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
