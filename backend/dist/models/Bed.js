"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bedSchema = new mongoose_1.default.Schema({
    hospitalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    category: { type: String, enum: ['ICU', 'General', 'Emergency', 'Ventilator'], required: true },
    total: { type: Number, default: 0 },
    occupied: { type: Number, default: 0 }
});
exports.default = mongoose_1.default.model('Bed', bedSchema);
