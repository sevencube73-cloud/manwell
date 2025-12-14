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

  settingsDoc.value = newVal;
  settingsDoc.updatedBy = req.user?._id;
  await settingsDoc.save();

  res.json({ message: 'Settings updated', settings: settingsDoc.value });
});
