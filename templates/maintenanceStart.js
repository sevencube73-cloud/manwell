/**
 * Generates the HTML for a maintenance mode start notification email.
 * @param {object} options - The options for the email.
 * @param {string} options.name - The name of the user.
 * @param {string} options.maintenanceTitle - The title from the maintenance settings.
 * @param {string} options.maintenanceMessage - The message from the maintenance settings.
 * @returns {string} The HTML content of the email.
 */
export const getMaintenanceStartHtml = ({ name, maintenanceTitle, maintenanceMessage }) => {
  const year = new Date().getFullYear();
  return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f7f8fa; padding: 40px 0;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ffc107, #ff9800); padding: 30px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Site Maintenance Starting Soon</h1>
        </div>

        <!-- Body -->
        <div style="padding: 35px; color: #333; line-height: 1.7;">
          <p style="font-size: 17px;">Hi <b>${name || 'Valued Customer'}</b>,</p>
          <p style="font-size: 16px;">
            Please be advised that our website will be temporarily unavailable as we perform scheduled maintenance. 
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h2 style="font-size: 18px; margin-top: 0; color: #856404;">${maintenanceTitle || 'Site Under Maintenance'}</h2>
            <p style="font-size: 15px; color: #856404; margin-bottom: 0;">${maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.'}</p>
          </div>

          <p style="font-size: 15px; color: #555;">
            We are working hard to improve our services for you. We apologize for any inconvenience this may cause and appreciate your patience.
          </p>

          <hr style="margin: 35px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 14px; color: #888;">
            Thank you for your understanding.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f2f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p style="margin:0;">© ${year} Manwell Store. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};
