"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dischargeHistorySchema = new mongoose_1.default.Schema({
    hospitalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Hospital', required: true },
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
exports.default = mongoose_1.default.model('DischargeHistory', dischargeHistorySchema);
