// models/Coupon.js
import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, uppercase: true, unique: true },
  description: String,
  discountType: { type: String, enum: ['percent', 'fixed'], required: true },
  amount: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Coupon = mongoose.model('Coupon', CouponSchema);
export default Coupon;
