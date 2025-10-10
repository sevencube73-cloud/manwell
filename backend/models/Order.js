import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderItems: [orderItemSchema],
  paymentMethod: String,
  totalPrice: Number,
  status: { type: String, default: 'Pending' }, // e.g., Pending, Processing, Shipped, Delivered
  deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deliveryStatus: { type: String, enum: ['Assigned', 'In Transit', 'Delivered'], default: 'Assigned' },
  // other fields...
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Find the last order by orderId (descending)
    const lastOrder = await mongoose.models.Order.findOne({ orderId: /^M\d+$/ }, {}, { sort: { createdAt: -1 } });
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderId) {
      const match = lastOrder.orderId.match(/M(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    this.orderId = `M${nextNumber.toString().padStart(2, '0')}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;

