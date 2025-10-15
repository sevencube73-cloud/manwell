import Coupon from '../models/Coupon.js';

// Create a new coupon (admin)
export const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all coupons (admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Validate a coupon (user side)
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

    if (!coupon) return res.status(404).json({ message: 'Invalid or inactive coupon' });

    const now = new Date();
    if (coupon.expiresAt && coupon.expiresAt < now)
      return res.status(400).json({ message: 'Coupon has expired' });

    if (orderValue < coupon.minOrderValue)
      return res.status(400).json({ message: `Minimum order value is ${coupon.minOrderValue}` });

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
      return res.status(400).json({ message: 'Coupon usage limit reached' });

    res.json({
      valid: true,
      discountType: coupon.discountType,
      amount: coupon.amount,
      message: 'Coupon applied successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update coupon (admin)
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
