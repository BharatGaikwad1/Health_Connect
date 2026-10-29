import mongoose from 'mongoose';

const dischargeHistorySchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  category: { type: String, enum: ['ICU', 'General', 'Emergency', 'Ventilator'], required: true },
  patientName: { type: String, default: 'In-Patient' },
  patientId: { type: String, default: () => `HC-${Math.floor(1000 + Math.random() * 9000)}` },
  dischargeDate: { type: Date, default: Date.now },
  reason: { type: String, default: 'Medical Stabilization & Recovery Complete' },
  bedsFreed: { type: Number, default: 1 },
  previousOccupied: { type: Number, default: 0 },
  newOccupied: { type: Number, default: 0 },
  dischargedBy: { type: String, default: 'Chief Medical Officer' }
}, {
  timestamps: true
});

export default mongoose.model('DischargeHistory', dischargeHistorySchema);
