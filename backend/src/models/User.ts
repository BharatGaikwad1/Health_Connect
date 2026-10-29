import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'hospital_admin', 'patient'], required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  
  // Profile Fields
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  bloodGroup: { type: String, default: 'O+' },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Not Specified'], default: 'Not Specified' },
  age: { type: Number, default: 0 },
  dateOfBirth: { type: String, default: '' },
  address: { type: String, default: '' },
  emergencyContactName: { type: String, default: '' },
  emergencyContactPhone: { type: String, default: '' },
  allergies: { type: String, default: 'None Reported' },
  chronicConditions: { type: String, default: 'None' },
  
  // Professional / Staff Fields (for hospital_admin and super_admin)
  designation: { type: String, default: '' },
  department: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('User', userSchema);
