import Order from '../models/Order.js';
import Product from '../models/product.js';
import User from '../models/User.js';


export const getAdminStats = async (req, res) => {
  try {
    // Orders
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    const totalOrders = orders.length;
    const newOrders = orders.filter(o => o.status === 'Pending').length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;

    // Products
    const products = await Product.find();
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    // Customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    // Agents
    const totalAgents = 0;

    // Revenue
    let paidRevenue = 0;
    let unpaidRevenue = 0;
    orders.forEach(order => {
      if (order.paymentMethod === 'Pay on Delivery' && order.status !== 'Completed') {
        unpaidRevenue += order.totalPrice || 0;
      } else {
        paidRevenue += order.totalPrice || 0;
      }
    });
    const totalRevenue = paidRevenue + unpaidRevenue;

    // Stock graph (sold and unpaid)
    const stockGraph = [];
    products.forEach(product => {
      let sold = 0;
      let unpaid = 0;
      orders.forEach(order => {
        order.orderItems.forEach(item => {
          if (String(item.product) === String(product._id)) {
            sold += item.qty;
            if (order.paymentMethod === 'Pay on Delivery' && order.status !== 'Completed') {
              unpaid += item.qty;
            }
          }
        });
      });
      stockGraph.push({ name: product.name, sold, unpaid });
    });

    res.json({
      totalOrders,
      newOrders,
      completedOrders,
      totalProducts,
      totalStock,
      totalRevenue,
      paidRevenue,
      unpaidRevenue,
      totalCustomers,
      totalAgents,
      stockGraph,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
};