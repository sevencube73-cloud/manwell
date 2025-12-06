import ShippingFee from '../models/ShippingFee.js';

// Public: get all shipping fee categories
export const getShippingFee = async (req, res) => {
  try {
    const fees = await ShippingFee.find();
    // If none exist, create a default entry for backward compatibility
    if (!fees || fees.length === 0) {
      const defaultFee = new ShippingFee({ category: 'Default', deliveryPointPrice: 0, doorDeliveryPrice: 0, description: 'Default shipping rates' });
      await defaultFee.save();
      return res.json([defaultFee]);
    }
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get shipping fees', error: err.message });
  }
};

// Get all shipping fees (admin - same as public but kept for route separation)
export const getAdminShippingFees = async (req, res) => {
  try {
    const fees = await ShippingFee.find();
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get shipping fees', error: err.message });
  }
};

// Create shipping fee category (admin)
export const createShippingFee = async (req, res) => {
  try {
    const { category, deliveryPointPrice, doorDeliveryPrice, description } = req.body;

    if (!category) return res.status(400).json({ message: 'Category is required' });
    if (deliveryPointPrice === undefined || doorDeliveryPrice === undefined) return res.status(400).json({ message: 'Both prices are required' });

    const fee = new ShippingFee({ category, deliveryPointPrice, doorDeliveryPrice, description: description || '' });
    await fee.save();
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create shipping fee', error: err.message });
  }
};

// Update shipping fee (admin)
export const updateShippingFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, deliveryPointPrice, doorDeliveryPrice, description } = req.body;

    const shippingFee = await ShippingFee.findByIdAndUpdate(
      id,
      { category, deliveryPointPrice, doorDeliveryPrice, description },
      { new: true }
    );

    if (!shippingFee) return res.status(404).json({ message: 'Shipping fee not found' });
    res.json(shippingFee);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update shipping fee', error: err.message });
  }
};

// Delete shipping fee (admin)
export const deleteShippingFee = async (req, res) => {
  try {
    const { id } = req.params;
    const shippingFee = await ShippingFee.findByIdAndDelete(id);
    if (!shippingFee) return res.status(404).json({ message: 'Shipping fee not found' });
    res.json({ message: 'Shipping fee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete shipping fee', error: err.message });
  }
};
