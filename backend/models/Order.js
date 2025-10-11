import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true }, // M01, M02, etc.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderItems: [orderItemSchema],
  shippingAddress: { type: Object },
  paymentMethod: { type: String },
  totalPrice: { type: Number },
  status: { type: String, default: 'Pending' }, // Pending, Processing, Shipped, Delivered, Cancelled
  deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deliveryStatus: { type: String, enum: ['Assigned', 'In Transit', 'Delivered'], default: 'Assigned' },
}, { timestamps: true });

// Auto-generate sequential orderId
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastOrder = await mongoose.models.Order.findOne({ orderId: /^M\d+$/ })
      .sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderId) {
      const match = lastOrder.orderId.match(/M(\d+)/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }
    this.orderId = `M${nextNumber.toString().padStart(2, '0')}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
