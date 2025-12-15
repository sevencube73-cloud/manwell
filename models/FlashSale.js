import mongoose from 'mongoose';

const flashSaleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  banner: {
    type: String, // URL to the banner image
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      flashPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      stockLimit: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended', 'paused'],
    default: 'scheduled',
  },
  priority: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

const FlashSale = mongoose.model('FlashSale', flashSaleSchema);

export default FlashSale;
