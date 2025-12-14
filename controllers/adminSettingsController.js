import asyncHandler from 'express-async-handler';
import AdminSetting from '../models/AdminSetting.js';

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
  // Add maintenance mode fields
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

  // If maintenance mode was changed, broadcast the new status to all clients
  if (typeof isMaintenanceMode === 'boolean') {
    req.io.emit('maintenanceStatusChanged', settingsDoc.value);
  }

  res.json({ message: 'Settings updated', settings: settingsDoc.value });
});
