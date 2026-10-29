import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  category: { type: String, enum: ['ICU', 'General', 'Emergency', 'Ventilator'], required: true },
  total: { type: Number, default: 0 },
  occupied: { type: Number, default: 0 }
});

export default mongoose.model('Bed', bedSchema);
