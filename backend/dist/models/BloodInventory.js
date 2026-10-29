"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bloodInventorySchema = new mongoose_1.default.Schema({
    hospitalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Hospital', required: true },
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
exports.default = mongoose_1.default.model('BloodInventory', bloodInventorySchema);
