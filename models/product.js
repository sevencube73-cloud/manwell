import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },

  // ⚠️ Products do NOT have stock - variants do!
  // basePrice is for display/reference only
  basePrice: { type: Number, required: true },

  category: { type: String },
  brand: { type: String, trim: true },

  // 🔥 Variant Support
  hasVariants: { type: Boolean, default: false },

  // Aggregated stock from variants (or standalone stock if no variants)
  totalStock: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },

  images: [
    {
      url: { type: String },
      public_id: { type: String },
    },
  ],

  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'active'
  },

  // SEO & Marketing
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },

  // Price ranges (cached from variants)
  minPrice: { type: Number },
  maxPrice: { type: Number },

}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;