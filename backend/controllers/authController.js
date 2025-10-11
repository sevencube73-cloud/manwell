import User from '../models/User.js';

// ✅ Register new user (no email verification, no auto-login)
export const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'Email already registered' });

    await User.create({
      name,
      email,
      password,
      phone,
      address,
    });

    // ✅ Success message only — no token returned
    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Please login.',
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Registration failed', error: error.message });
  }
};
