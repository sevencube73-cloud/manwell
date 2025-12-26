import mongoose from 'mongoose';

const variantAttributeSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true 
    }, // e.g., "Size", "Color", "Material"
    
    values: [
      { 
        type: String, 
        trim: true 
      }
    ], // e.g., ["S", "M", "L", "XL"] or ["Red", "Blue", "Green"]
    
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
    
    displayOrder: { 
      type: Number, 
      default: 0 
    }, // For sorting on frontend
  },
  { timestamps: true }
);

const VariantAttribute = mongoose.model('VariantAttribute', variantAttributeSchema);
export default VariantAttribute;
