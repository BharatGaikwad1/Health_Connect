import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, default: '+91 231 264 1125' },
  emergencyContact: { type: String, default: '+91 108' },
  lat: { type: Number, default: 16.7050 },
  lng: { type: Number, default: 74.2433 },
  adminEmail: { type: String, required: true },
  category: { type: String, default: 'Multi-Specialty & Trauma Care' },
  city: { type: String, default: 'Kolhapur' },
  website: { type: String, default: 'https://healthconnect.care' },
  totalBeds: { type: Number, default: 50 },
  icuBeds: { type: Number, default: 15 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  licenseNumber: { type: String, default: '' },
  documentName: { type: String, default: '' },
  documentType: { type: String, default: 'Medical Establishment License' },
  documentUrl: { type: String, default: '' },
  documentUploadedAt: { type: Date },
  isOtpVerified: { type: Boolean, default: false },
  otpCode: { type: String, default: '' },
  otpExpiresAt: { type: Date },
  rejectionReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Hospital', hospitalSchema);

