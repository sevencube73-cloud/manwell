import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Create a new order
export const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;
  if (!orderItems || orderItems.length === 0)
    return res.status(400).json({ message: 'No order items' });

  try {
    const processedOrderItems = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.product}` });
      const qtyToBuy = Math.min(item.qty, product.stock);
      product.stock -= qtyToBuy;
      await product.save();
      processedOrderItems.push({ product: product._id, qty: qtyToBuy, price: product.price });
    }

    const order = new Order({
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

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phoneNumber').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phoneNumber')
      .populate('orderItems.product', 'name price');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Get orders of the logged-in user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status || order.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};
