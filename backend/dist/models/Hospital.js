"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const hospitalSchema = new mongoose_1.default.Schema({
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
exports.default = mongoose_1.default.model('Hospital', hospitalSchema);
