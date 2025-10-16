import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

// ✅ Register new user (with activation email)
export const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    // 1️⃣ Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already registered" });

    // 2️⃣ Create activation token
    const activationToken = crypto.randomBytes(32).toString("hex");

    // 3️⃣ Create user but mark as inactive
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      isActive: false,
      activationToken,
    });

    // 4️⃣ Generate activation link
    const activationLink = `${process.env.FRONTEND_URL}/activate/${activationToken}`;

    // 5️⃣ Send activation email via Resend
    const html = `
      <div style="font-family:sans-serif;line-height:1.5;">
        <h2>Welcome to Muzamilafey Digital</h2>
        <p>Click below to activate your account:</p>
        <a href="${activationLink}"
           style="background-color:#4CAF50;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">
           Activate Account
        </a>
        <p>If you didn’t register, please ignore this email.</p>
      </div>
    `;

    await sendEmail(user.email, "Activate your Muzamilafey Account", html);

    res.status(201).json({
      success: true,
      message:
        "Account registered successfully. Please check your email to activate your account.",
    });
  } catch (error) {
    console.error("❌ Registration failed:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ✅ Activate user
export const activateUser = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ activationToken: token });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired activation link" });

    user.isActive = true;
    user.activationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Account activated successfully. You can now log in.",
    });
  } catch (error) {
    console.error("❌ Activation error:", error);
    res.status(500).json({
      message: "Account activation failed",
      error: error.message,
    });
  }
};

// ✅ Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // Check if user is active
    if (!user.isActive)
      return res.status(403).json({
        message: "Please activate your account first. Check your email.",
      });

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login failed:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
