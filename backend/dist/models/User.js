"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'hospital_admin', 'patient'], required: true },
    hospitalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Hospital' },
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
exports.default = mongoose_1.default.model('User', userSchema);
