import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// ✅ Register new user (no email verification)
export const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
    });

    // Directly generate token after registration
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Registration failed', error: error.message });
  }
};

// ✅ Login user (no email verification check)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    if (user.isActive === false)
      return res.status(403).json({
        message:
          'Your account has been deactivated. Please contact support.',
      });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
