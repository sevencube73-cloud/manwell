import mongoose from 'mongoose';

const AdminSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Helper to get or create the singleton settings doc
AdminSettingSchema.statics.getSettings = async function () {
  const settings = await this.findOne({ key: 'payment_settings' });
  if (settings) return settings;
  const created = await this.create({
    key: 'payment_settings',
    value: { 
      mpesaEnabled: false, 
      payOnDeliveryEnabled: true, 
      marqueeText: '',
      isEmailVerificationRequired: true,
      isMaintenanceMode: false,
      maintenanceTitle: 'Site Under Maintenance',
      maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.',
    },
  });
  return created;
};

const AdminSetting = mongoose.model('AdminSetting', AdminSettingSchema);
export default AdminSetting;
