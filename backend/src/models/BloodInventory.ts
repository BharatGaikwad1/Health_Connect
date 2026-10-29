import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  units: { type: Number, default: 0, min: 0 },
  status: { 
    type: String, 
    enum: ['Available', 'Low Stock', 'Critical', 'Surplus'], 
    default: 'Available' 
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Unique compound index so each hospital has at most one record per blood group
bloodInventorySchema.index({ hospitalId: 1, bloodGroup: 1 }, { unique: true });

export default mongoose.model('BloodInventory', bloodInventorySchema);
