// Admin verifies a customer account
export const verifyCustomerByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'user' && user.role !== 'customer') return res.status(400).json({ message: 'Only user/customer accounts can be verified' });
    if (user.isVerified) return res.status(400).json({ message: 'Customer is already verified' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Customer verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying customer', error: error.message });
  }
};
// Delete a customer (admin only)
export const deleteCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
  // Allow deleting any user regardless of role
    await user.deleteOne();
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
};
// Deactivate a customer (admin only)
export const deactivateCustomer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'customer') return res.status(400).json({ message: 'Only customers can be deactivated' });
    res.json({ message: 'Customer deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating customer', error: error.message });
  }
};

// Admin activates a customer account
export const activateCustomer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'user' && user.role !== 'customer') return res.status(400).json({ message: 'Only user/customer accounts can be activated' });
    res.json({ message: 'Customer activated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error activating customer', error: error.message });
  }
};
import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    // Email update usually not allowed or requires re-verification, so skip here
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    if (req.body.password) user.password = req.body.password;

    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    // Support both 'user' and 'customer' roles for compatibility
    const customers = await User.find({ role: { $in: ['user', 'customer'] } }).select('-password');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};