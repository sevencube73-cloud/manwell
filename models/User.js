import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
    isActive: { type: Boolean, default: true },

    // 🔐 Saved Shipping Addresses
    shippingAddresses: [{
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      fullName: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
      isDefault: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],

    // 🔐 Password reset fields (for Resend integration)
    resetToken: { type: String },
    resetTokenExpire: { type: Date },

    // 🔐 Email verification fields
    // New registrations require email verification by default (OTP flow)
    isEmailVerified: { type: Boolean, default: false },
    // OTP-based verification fields
    emailOTP: { type: String },
    emailOTPExpire: { type: Date },
    // Legacy token-based verification (kept for compatibility)
    verificationToken: { type: String },
    verificationTokenExpire: { type: Date },

    // 🔐 Google OAuth fields
    googleId: { type: String, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    profilePicture: { type: String },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
