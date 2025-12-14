import asyncHandler from 'express-async-handler';
import AdminSetting from '../models/AdminSetting.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getMaintenanceStartHtml } from '../templates/maintenanceStart.js';
import { getMaintenanceEndHtml } from '../templates/maintenanceEnd.js';

// GET /api/admin/settings  (public read)
export const getSettings = asyncHandler(async (req, res) => {
  const settingsDoc = await AdminSetting.getSettings();
  res.json({ settings: settingsDoc.value });
});

// PUT /api/admin/settings  (admin only)
export const updateSettings = asyncHandler(async (req, res) => {
  const { 
    mpesaEnabled, 
    payOnDeliveryEnabled, 
    marqueeText,
    isEmailVerificationRequired,
    isMaintenanceMode,
    maintenanceTitle,
    maintenanceMessage,
  } = req.body;

  const settingsDoc = await AdminSetting.getSettings();
  const oldMaintenanceStatus = settingsDoc.value.isMaintenanceMode;

  const newVal = { ...settingsDoc.value };

  if (typeof mpesaEnabled === 'boolean') {
    newVal.mpesaEnabled = mpesaEnabled;
  }
  if (typeof payOnDeliveryEnabled === 'boolean') {
    newVal.payOnDeliveryEnabled = payOnDeliveryEnabled;
  }
  if (typeof marqueeText === 'string') {
    newVal.marqueeText = marqueeText;
  }
  if (typeof isEmailVerificationRequired === 'boolean') {
    newVal.isEmailVerificationRequired = isEmailVerificationRequired;
  }
  if (typeof isMaintenanceMode === 'boolean') {
    newVal.isMaintenanceMode = isMaintenanceMode;
  }
  if (typeof maintenanceTitle === 'string') {
    newVal.maintenanceTitle = maintenanceTitle;
  }
  if (typeof maintenanceMessage === 'string') {
    newVal.maintenanceMessage = maintenanceMessage;
  }

  settingsDoc.value = newVal;
  settingsDoc.updatedBy = req.user?._id;
  await settingsDoc.save();

  // If maintenance mode status has changed, notify users.
  if (typeof isMaintenanceMode === 'boolean' && isMaintenanceMode !== oldMaintenanceStatus) {
    // 1. Notify connected clients via WebSocket for instant UI update
    req.app.get('io').emit('maintenanceStatusChanged', settingsDoc.value);

    // 2. Asynchronously send emails to all users.
    // Note: For a large user base, this should be offloaded to a background job queue.
    (async () => {
      try {
        const users = await User.find({ role: { $in: ['user', 'customer'] } }, 'name email');
        const subject = isMaintenanceMode ? 'Site Maintenance Starting' : 'We Are Back Online!';
        
        console.log(`Sending maintenance notifications to ${users.length} users...`);

        for (const user of users) {
          const html = isMaintenanceMode
            ? getMaintenanceStartHtml({ 
                name: user.name, 
                maintenanceTitle: settingsDoc.value.maintenanceTitle,
                maintenanceMessage: settingsDoc.value.maintenanceMessage,
              })
            : getMaintenanceEndHtml({ name: user.name });

          // Fire-and-forget: send email without awaiting to not block the loop.
          sendEmail({ to: user.email, subject, html }).catch(err => {
            console.error(`Failed to send maintenance email to ${user.email}:`, err.message);
          });
        }
      } catch (error) {
        console.error('Failed to fetch users for maintenance notification:', error);
      }
    })();
  }

  res.json({ message: 'Settings updated successfully', settings: settingsDoc.value });
});
