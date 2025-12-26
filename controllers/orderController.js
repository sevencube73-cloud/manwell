import Order from '../models/Order.js';
import Product from '../models/product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import FlashSale from '../models/FlashSale.js';
import FlashSaleLog from '../models/FlashSaleLog.js';
import { sendEmail } from '../utils/sendEmail.js';
import Transaction from '../models/Transaction.js';
import ProductVariant from '../models/ProductVariant.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      discount = { type: null, value: 0 },
      couponCode = null,
      finalAmount,
      phone,
      shippingFee = 0,
      shippingCategory = null,
      deliveryType = 'door',
    } = req.body;

    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ message: 'No order items provided' });

    const now = new Date();
    const activeSales = await FlashSale.find({
      startTime: { $lte: now },
      endTime: { $gt: now },
      status: 'active',
    });

    const processedItems = [];
    const shouldReserveNow = !(paymentMethod === 'Pesapal' || paymentMethod === 'Mpesa');

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.status(404).json({ message: `Product not found: ${item.product}` });

      let price = product.basePrice || product.price;
      let sale = null;
      let productInSale = null;
      let variant = null;
      let attributes = {};

      // Check if variant is used
      if (item.variantId) {
        variant = await ProductVariant.findById(item.variantId);
        if (!variant) return res.status(404).json({ message: `Variant not found for product ${product.name}` });
        if (variant.productId.toString() !== product._id.toString()) {
          return res.status(400).json({ message: `Variant mismatch for product ${product.name}` });
        }
        price = variant.price;

        // Fix: Ensure attributes are a plain object
        const variantObj = variant.toObject({ flattenMaps: true });
        attributes = variantObj.attributes || {};
      }

      // Check if product is in any active flash sale
      for (const activeSale of activeSales) {
        const foundProduct = activeSale.products.find(p => p.productId.toString() === product._id.toString());
        if (foundProduct) {
          sale = activeSale;
          productInSale = foundProduct;
          break;
        }
      }

      if (sale && productInSale) {
        price = productInSale.flashPrice;

        if (item.qty > productInSale.stockLimit) {
          return res.status(400).json({ message: `Not enough flash sale stock for ${product.name}` });
        }

        const userPurchaseCount = await FlashSaleLog.countDocuments({
          saleId: sale._id,
          productId: product._id,
          userId: req.user._id,
        });

        if (userPurchaseCount + item.qty > sale.perUserLimit) {
          return res.status(400).json({ message: `You have exceeded the purchase limit for ${product.name} in this flash sale.` });
        }

        if (shouldReserveNow) {
          productInSale.stockLimit -= item.qty;
          if (variant) {
            variant.stock -= item.qty;
            await variant.save();
          } else {
            product.stock -= item.qty;
            await product.save();
          }
          await sale.save();

          const flashSaleLog = new FlashSaleLog({
            saleId: sale._id,
            productId: product._id,
            userId: req.user._id,
            quantity: item.qty,
          });
          await flashSaleLog.save();
        }

      } else {
        if (variant) {
          if (item.qty > variant.stock)
            return res.status(400).json({ message: `Not enough stock for ${product.name} (Variant: ${item.sku || variant.sku})` });

          if (shouldReserveNow) {
            variant.stock -= item.qty;
            await variant.save();
          }
        } else {
          if (item.qty > product.stock)
            return res.status(400).json({ message: `Not enough stock for ${product.name}` });

          if (shouldReserveNow) {
            product.stock -= item.qty;
            await product.save();
          }
        }
      }

      processedItems.push({
        product: product._id,
        qty: item.qty,
        price: price,
        name: product.name,
        image: product.images?.[0]?.url || product.image || '',
        variantId: variant ? variant._id : undefined,
        sku: variant ? variant.sku : (product.sku || item.sku || 'N/A'),
        attributes: attributes // Use sanitized attributes
      });
    }

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (!coupon)
        return res.status(400).json({ message: 'Invalid or inactive coupon' });

      const now = new Date();
      if (coupon.expiresAt && coupon.expiresAt < now)
        return res.status(400).json({ message: 'Coupon has expired' });

      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
        return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems: processedItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingFee,
      shippingCategory,
      deliveryType,
      discountType: discount?.type || null,
      discountValue: discount?.value || 0,
      couponCode: couponCode || null,
      finalAmount,
      status: paymentMethod === 'Pesapal' || paymentMethod === 'Mpesa' ? 'Pending' : 'Processing',
    });

    await order.save();

    // Send styled HTML email
    (async () => {
      try {
        const companyName = process.env.COMPANY_NAME || 'Manwell';
        const frontend = process.env.FRONTEND_URL || 'https://manwellstore.com';
        const orderNumber = order.orderId || order._id;
        const user = await User.findById(req.user._id).select('name email');

        // Styles
        const mainColor = '#111827';
        const secondaryColor = '#4f46e5';
        const greyColor = '#6b7280';
        const lightBg = '#f9fafb';
        const border = '1px solid #e5e7eb';

        const itemsHtml = (order.orderItems || []).map(it => {
          const img = it.image ? `<img src="${it.image}" alt="" style="width:50px;height:50px;object-fit:cover;border-radius:6px;margin-right:12px;float:left">` : '';

          // Format attributes cleanly
          let attrs = '';
          if (it.attributes && Object.keys(it.attributes).length > 0) {
            const parts = Object.entries(it.attributes).map(([k, v]) => `<span style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:11px;color:#374151;margin-right:4px">${k}: ${v}</span>`);
            attrs = `<div style="margin-top:4px;">${parts.join('')}</div>`;
          }

          return `
            <tr style="border-bottom:${border}">
              <td style="padding:16px 8px;">
                 ${img}
                 <div style="overflow:hidden">
                    <div style="font-weight:600;font-size:14px;color:#111">${it.name}</div>
                    ${attrs}
                 </div>
              </td>
              <td style="padding:16px 8px;text-align:center;font-size:14px">x${it.qty}</td>
              <td style="padding:16px 8px;text-align:right;font-weight:600;font-size:14px">KES ${Number(it.price).toLocaleString()}</td>
            </tr>
          `;
        }).join('');

        const subtotal = Number(order.totalPrice || 0).toLocaleString();
        const shipping = Number(order.shippingFee || 0).toLocaleString();
        const total = Number(order.finalAmount || order.totalPrice || 0).toLocaleString();

        const subject = `Confirmed: Your order #${orderNumber}`;

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
               
               <!-- Header -->
               <div style="background:${mainColor};padding:24px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;letter-spacing:0.5px">Order Confirmed</h1>
               </div>

               <!-- Status Section -->
               <div style="padding:32px 24px;text-align:center;border-bottom:${border}">
                  <div style="width:48px;height:48px;background:${secondaryColor};color:white;border-radius:50%;line-height:48px;font-size:24px;margin:0 auto 16px;">✓</div>
                  <h2 style="margin:0 0 8px;font-size:24px;color:#111">Thanks for your order!</h2>
                  <p style="margin:0;color:${greyColor};font-size:16px">Hi ${user?.name || 'there'}, we're getting your order ready.</p>
                  <p style="margin:0;font-size:14px;color:${greyColor};margin-top:4px">Order ID: #${orderNumber}</p>
               </div>

               <!-- Items Table -->
               <div style="padding:0 24px;">
                  <table style="width:100%;border-collapse:collapse;">
                     <thead>
                        <tr style="border-bottom:2px solid ${lightBg}">
                           <th style="padding:12px 8px;text-align:left;font-size:12px;text-transform:uppercase;color:${greyColor}">Item</th>
                           <th style="padding:12px 8px;text-align:center;font-size:12px;text-transform:uppercase;color:${greyColor}">Qty</th>
                           <th style="padding:12px 8px;text-align:right;font-size:12px;text-transform:uppercase;color:${greyColor}">Price</th>
                        </tr>
                     </thead>
                     <tbody>
                        ${itemsHtml}
                     </tbody>
                  </table>
               </div>

               <!-- Totals -->
               <div style="background:${lightBg};padding:24px;margin-top:20px;">
                  <table style="width:100%">
                     <tr>
                        <td style="padding:4px;color:${greyColor}">Subtotal</td>
                        <td style="padding:4px;text-align:right;font-weight:500">KES ${subtotal}</td>
                     </tr>
                     <tr>
                        <td style="padding:4px;color:${greyColor}">Shipping</td>
                        <td style="padding:4px;text-align:right;font-weight:500">KES ${shipping}</td>
                     </tr>
                     ${order.discountValue > 0 ? `
                     <tr>
                        <td style="padding:4px;color:#059669">Discount</td>
                        <td style="padding:4px;text-align:right;color:#059669">- KES ${Number(order.discountValue).toLocaleString()}</td>
                     </tr>` : ''}
                     <tr>
                        <td style="padding:12px 4px;font-weight:700;font-size:18px;border-top:1px solid #d1d5db;margin-top:8px">Total</td>
                        <td style="padding:12px 4px;text-align:right;font-weight:700;font-size:18px;border-top:1px solid #d1d5db;margin-top:8px;color:${secondaryColor}">KES ${total}</td>
                     </tr>
                  </table>
               </div>

               <!-- Shipping Info -->
               <div style="padding:24px;border-top:${border}">
                  <h3 style="margin:0 0 12px;font-size:16px;color:#111">Delivery Details</h3>
                  <div style="font-size:14px;color:#4b5563;line-height:1.5">
                     <strong>Address:</strong><br>
                     ${order.shippingAddress?.fullName}<br>
                     ${order.shippingAddress?.address}<br>
                     ${order.shippingAddress?.city}, ${order.shippingAddress?.county || ''}
                  </div>
                  <div style="font-size:14px;color:#4b5563;line-height:1.5;margin-top:12px">
                     <strong>Payment Method:</strong> ${order.paymentMethod}
                  </div>
               </div>

               <!-- Footer -->
               <div style="text-align:center;padding:24px;border-top:${border}">
                  <a href="${frontend}/order/${order._id}/track" style="display:inline-block;background:${secondaryColor};color:white;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px">Track Order</a>
                  <p style="margin-top:24px;font-size:12px;color:#9ca3af">
                     Need help? Reply to this email.<br>
                     &copy; ${new Date().getFullYear()} ${companyName}.
                  </p>
               </div>

            </div>
          </body>
          </html>
        `;

        if (user && user.email) {
          await sendEmail({ to: user.email, subject, html });
        }
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
      }
    })();

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order', error: error.message });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phoneNumber')
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });

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

    if (req.user && req.user.role === 'admin') return res.json(order);
    if (req.user && order.user && order.user._id && order.user._id.toString() === req.user._id.toString()) {
      return res.json(order);
    }

    return res.status(403).json({ message: 'Not authorized to view this order' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Get orders of logged-in user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your orders', error: error.message });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status || order.status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Get order tracking history (owner or admin)
export const getOrderTrack = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('statusHistory.updatedBy', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user && req.user.role === 'admin') return res.json({ status: order.status, history: order.statusHistory });
    if (req.user && order.user && order.user.toString() === req.user._id.toString()) {
      return res.json({ status: order.status, history: order.statusHistory });
    }
    return res.status(403).json({ message: 'Not authorized to view this order tracking' });
  } catch (error) {
    console.error('Error fetching order tracking:', error.message || error);
    res.status(500).json({ message: 'Error fetching order tracking', error: error.message });
  }
};

// Admin: append a status update to order tracking
export const adminUpdateOrderTrack = async (req, res) => {
  try {
    const { status, note } = req.body;
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status value. Allowed: ${allowedStatuses.join(', ')}` });
    }

    const entry = { status: status || order.status, note: note || '', updatedBy: req.user?._id, date: new Date() };

    const update = { $push: { statusHistory: entry } };
    if (status) update.$set = { status };

    const updated = await Order.findByIdAndUpdate(orderId, update, { new: true });
    return res.json({ message: 'Order tracking updated', status: updated.status, history: updated.statusHistory });
  } catch (error) {
    console.error('Error updating order tracking:', error.message || error);
    res.status(500).json({ message: 'Error updating order tracking', error: error.message });
  }
};

// Admin: return printable order details (JSON) for printing on frontend
export const adminGetOrderPrint = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name price');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (error) {
    console.error('Error getting printable order:', error.message || error);
    res.status(500).json({ message: 'Error preparing printable order', error: error.message });
  }
};

// Admin: send payment reminder to customer for unpaid orders
export const sendPaymentReminder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    const frontend = process.env.FRONTEND_URL || 'https://manwellstore.com';
    const payLink = `${frontend}/pay?orderId=${order._id}`;

    const subject = `Payment reminder for order ${order.orderId || order._id}`;
    const html = `
      <p>Hi ${order.user?.name || 'Customer'},</p>
      <p>This is a reminder to complete payment for your order <strong>${order.orderId || order._id}</strong>.</p>
      <p>Amount due: <strong>KES ${(order.finalAmount || order.totalPrice).toFixed(2)}</strong></p>
      <p>Please complete payment here: <a href="${payLink}">Complete payment</a></p>
      <p>If you've already paid, please ignore this message.</p>
    `;

    const reminderMessage = `Payment reminder sent for order ${order.orderId || order._id} - Amount due: KES ${(order.finalAmount || order.totalPrice).toFixed(2)}`;
    order.reminders = order.reminders || [];
    order.reminders.push({
      message: reminderMessage,
      sentAt: new Date(),
      read: false,
    });
    await order.save();

    try {
      if (order.user?.email) {
        await sendEmail({ to: order.user.email, subject, html });
      }
    } catch (emailErr) {
      console.error('Failed to send payment reminder email:', emailErr.message || emailErr);
    }

    res.json({ message: 'Payment reminder sent' });
  } catch (error) {
    console.error('Error sending payment reminder:', error.message || error);
    res.status(500).json({ message: 'Failed to send payment reminder' });
  }
};

// Get all reminders for the logged-in customer
export const getReminderMessages = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .select('orderId _id finalAmount totalPrice paymentStatus reminders createdAt')
      .sort({ createdAt: -1 });

    const allReminders = [];
    orders.forEach((order) => {
      if (order.reminders && order.reminders.length > 0) {
        order.reminders.forEach((reminder) => {
          allReminders.push({
            _id: reminder._id,
            orderId: order.orderId || order._id,
            orderDbId: order._id,
            message: reminder.message,
            sentAt: reminder.sentAt,
            read: reminder.read,
            paymentStatus: order.paymentStatus,
            amount: order.finalAmount || order.totalPrice,
          });
        });
      }
    });

    res.json(allReminders);
  } catch (error) {
    console.error('Error fetching reminders:', error.message || error);
    res.status(500).json({ message: 'Error fetching reminders', error: error.message });
  }
};

// Mark a reminder as read
export const markReminderAsRead = async (req, res) => {
  try {
    const { orderId, reminderId } = req.body;
    let order = null;
    try {
      order = await Order.findById(orderId);
    } catch (e) {
      order = null;
    }
    if (!order) {
      order = await Order.findOne({ orderId: orderId });
    }
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const reminder = order.reminders.id(reminderId);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    reminder.read = true;
    await order.save();

    res.json({ message: 'Reminder marked as read' });
  } catch (error) {
    console.error('Error marking reminder as read:', error.message || error);
    res.status(500).json({ message: 'Error updating reminder' });
  }
};

// Admin: update payment status (mark Paid/Unpaid)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!['Paid', 'Unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (paymentStatus === 'Paid' && order.paymentStatus !== 'Paid') {
      for (const item of order.orderItems) {
        try {
          const product = await Product.findById(item.product);
          if (!product) continue;

          if (item.variantId) {
            const variant = await ProductVariant.findById(item.variantId);
            if (variant) {
              if (item.qty > variant.stock) {
                console.warn(`Insufficient variant stock while marking order paid: ${product.name} - ${variant.sku}`);
              } else {
                variant.stock -= item.qty;
                await variant.save();
              }
              continue;
            }
          }

          if (item.qty > product.stock) {
            console.warn(`Insufficient stock while marking order paid: ${product._id}`);
          } else {
            product.stock -= item.qty;
            await product.save();
          }
        } catch (pErr) {
          console.error('Error decrementing stock while marking paid:', pErr.message || pErr);
        }
      }

      order.paymentStatus = 'Paid';
      order.status = order.status === 'Pending' ? 'Processing' : order.status;
      await order.save();

      try {
        const tx = new Transaction({
          user: order.user,
          mpesaReceiptNumber: null,
          phoneNumber: order.shippingAddress?.phone || undefined,
          amount: order.finalAmount || order.totalPrice || 0,
          status: 'AdminMarkedPaid',
          rawResponse: { note: 'Marked Paid by admin' },
        });
        await tx.save();
      } catch (txErr) {
        console.error('Failed to record admin-marked transaction:', txErr.message || txErr);
      }

      return res.json({ message: 'Order marked as Paid', order });
    }

    if (paymentStatus === 'Unpaid') {
      order.paymentStatus = 'Unpaid';
      await order.save();
      return res.json({ message: 'Order marked as Unpaid', order });
    }

    res.json({ message: 'No change' });
  } catch (error) {
    console.error('Error updating payment status:', error.message || error);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
};

// Delete an order (admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!['Delivered', 'Shipped'].includes(order.status)) {
      for (const item of order.orderItems) {
        try {
          if (item.variantId) {
            const variant = await ProductVariant.findById(item.variantId);
            if (variant) {
              variant.stock = (variant.stock || 0) + (item.qty || 0);
              await variant.save();
              continue;
            }
          }

          const product = await Product.findById(item.product);
          if (!product) continue;
          product.stock = (product.stock || 0) + (item.qty || 0);
          await product.save();
        } catch (pErr) {
          console.error('Error restoring product stock on order delete:', pErr.message);
        }
      }
    }

    await Order.findByIdAndDelete(order._id);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    console.error('Delete order error:', error.message);
    res.status(500).json({ message: 'Server error deleting order', error: error.message });
  }
};
