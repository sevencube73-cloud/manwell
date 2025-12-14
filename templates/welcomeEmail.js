/**
 * Generates the HTML for a welcome email.
 * @param {object} options - The options for the email.
 * @param {string} options.name - The name of the user.
 * @returns {string} The HTML content of the email.
 */
export const getWelcomeEmailHtml = ({ name }) => {
  const year = new Date().getFullYear();
  return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #007bff, #00c6ff); padding: 30px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Welcome to Manwell Store!</h1>
        </div>

        <!-- Body -->
        <div style="padding: 35px; color: #333; line-height: 1.7;">
          <p style="font-size: 17px;">Hi <b>${name || 'Valued Customer'}</b>,</p>
          <p style="font-size: 16px;">
            We're thrilled to have you join the Manwell family. Get ready to discover amazing products and enjoy a seamless shopping experience.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'https://manwell.com'}" 
              style="background: linear-gradient(135deg, #007bff, #00c6ff); color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Start Shopping
            </a>
          </div>

          <p style="font-size: 15px; color: #555;">
            As a registered member, you can now:
          </p>
          <ul style="font-size: 15px; color: #555; padding-left: 20px;">
            <li>Track your orders in real-time</li>
            <li>Save your shipping addresses for faster checkout</li>
            <li>Manage your account and view your order history</li>
            <li>Receive exclusive offers and discounts</li>
          </ul>

          <hr style="margin: 35px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 14px; color: #888;">
            If you have any questions, feel free to contact our support team. We're always here to help!
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f2f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p style="margin:0;">© ${year} Manwell Store. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Nairobi, Kenya</p>
        </div>
      </div>
    </div>
  `;
};
