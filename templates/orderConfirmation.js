/**
 * Order confirmation email template
 * @param {string} name - Customer's name
 * @param {string} orderId - Order ID
 * @param {number} total - Order total amount
 * @param {string} trackingUrl - URL to track order
 * @returns {string} HTML email content
 */
export const orderConfirmationTemplate = (
  name,
  orderId,
  total,
  trackingUrl = "#"
) => {
  const companyName = "Manwell Store";
  const supportEmail = "manwellstore@gmail.com";

  return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 25px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 22px;">✅ Order Confirmed</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #333;">
          <p style="font-size: 16px;">Hello <b>${
            name || "Valued Customer"
          }</b>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            Thank you for your purchase! Your order has been received and is being prepared for shipment.
          </p>

          <!-- Order Details Card -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4f46e5;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Order Details</p>
            <p style="margin: 5px 0; font-size: 16px;">
              <b>Order ID:</b> <span style="color: #4f46e5; font-weight: 700;">#${orderId}</span>
            </p>
            <p style="margin: 5px 0; font-size: 16px;">
              <b>Total Amount:</b> <span style="color: #28a745; font-weight: 700;">KES ${Number(
                total
              ).toFixed(2)}</span>
            </p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <b>Date:</b> ${new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <!-- What's Next Section -->
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0084ff;">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #333;"><b>What happens next?</b></p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555;">
              <li style="margin-bottom: 8px;">📦 We'll prepare your order for shipment</li>
              <li style="margin-bottom: 8px;">📬 You'll receive tracking information via email</li>
              <li>🚚 Follow your delivery status anytime using the link below</li>
            </ul>
          </div>

          <!-- Track Order Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" 
              style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Track Your Order
            </a>
          </div>

          <!-- Customer Service -->
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <b>Need Help?</b><br>
              If you have any questions about your order, please don't hesitate to contact our customer support team at 
              <a href="mailto:${supportEmail}" style="color: #007bff; text-decoration: none;">${supportEmail}</a>.
            </p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            Thank you for choosing <b>${companyName}</b>. We appreciate your business!
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
          <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};
