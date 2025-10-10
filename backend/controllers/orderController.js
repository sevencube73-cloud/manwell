import * as OrderModule from '../models/Order.js';
import * as NextOrderIdModule from '../utils/getNextOrderId.js';

export const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;
  if (!orderItems || orderItems.length === 0)
    return res.status(400).json({ message: 'No order items' });

  try {
    // Import Product model correctly
  const Product = (await import('../models/product.js')).default;
    const processedOrderItems = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.stock < 1) {
        return res.status(400).json({ message: `Product is out of stock.` });
      }
      const qtyToBuy = Math.min(item.qty, product.stock);
      product.stock -= qtyToBuy;
      await product.save();
      processedOrderItems.push({
        product: product._id,
        qty: qtyToBuy,
        price: product.price
      });
    }

    // Get next sequential orderId
  const orderId = await NextOrderIdModule.default();

      const order = new OrderModule.default({
      orderId,
      user: req.user._id,
      orderItems: processedOrderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: paymentMethod === 'Pay on Delivery' ? 'Pending' : 'Pending',
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
  const orders = await OrderModule.default.find({ user: req.user._id })
      .populate({
        path: 'orderItems.product',
        model: 'Product',
      })
      .sort({ createdAt: -1 });
  // Always include orderId in response
    // Only return true orderId (M*)
    res.json(orders.map(o => ({ ...o.toObject(), orderId: o.orderId })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
  const orders = await OrderModule.default.find().populate('user', 'name email').sort({ createdAt: -1 });
  // Always include orderId in response
  res.json(orders.map(o => ({ ...o.toObject(), orderId: o.orderId })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
  const order = await OrderModule.default.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status || order.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};