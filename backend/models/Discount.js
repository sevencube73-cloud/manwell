const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  // type: percent or fixed
  discountType: { type: String, enum: ['percent', 'fixed'], required: true },
  amount: { type: Number, required: true },
  // applyTo: product id or null for global
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  startsAt: { type: Date, default: Date.now },
  endsAt: { type: Date },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Discount', DiscountSchema);