import mongoose from 'mongoose';

const shippingFeeSchema = new mongoose.Schema({
  category: { type: String, required: true, default: 'Default' },
  deliveryPointPrice: { type: Number, required: true, min: 0, default: 0 },
  doorDeliveryPrice: { type: Number, required: true, min: 0, default: 0 },
  description: { type: String, default: '' }
}, { timestamps: true });

const ShippingFee = mongoose.model('ShippingFee', shippingFeeSchema);
export default ShippingFee;
