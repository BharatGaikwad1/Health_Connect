"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDischargeHistory = exports.recordPatientDischarge = exports.updateBed = exports.getHospitalBeds = void 0;
const Bed_1 = __importDefault(require("../models/Bed"));
const DischargeHistory_1 = __importDefault(require("../models/DischargeHistory"));
const BED_CATEGORIES = ['ICU', 'General', 'Emergency', 'Ventilator'];
// Get beds for a specific hospital
const getHospitalBeds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId } = req.params;
        let beds = yield Bed_1.default.find({ hospitalId });
        // Seed defaults if hospital has no bed records initialized yet
        if (beds.length === 0) {
            const defaultRecords = BED_CATEGORIES.map((cat) => ({
                hospitalId,
                category: cat,
                total: cat === 'ICU' ? 20 : cat === 'Ventilator' ? 10 : cat === 'Emergency' ? 25 : 50,
                occupied: cat === 'ICU' ? 12 : cat === 'Ventilator' ? 4 : cat === 'Emergency' ? 15 : 24
            }));
            beds = yield Bed_1.default.insertMany(defaultRecords);
        }
        res.json(beds);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getHospitalBeds = getHospitalBeds;
// Update bed status & automatically log discharge history when occupied beds decrease
const updateBed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, category } = req.params;
        const { total, occupied, patientName, reason } = req.body;
        let bed = yield Bed_1.default.findOne({ hospitalId, category });
        if (!bed) {
            bed = yield Bed_1.default.create({ hospitalId, category, total: total || 20, occupied: occupied || 10 });
        }
        else {
            const oldOccupied = bed.occupied;
            const newOccupied = occupied !== undefined ? occupied : bed.occupied;
            // If occupied count decreased, beds were freed by discharging patients
            if (occupied !== undefined && newOccupied < oldOccupied) {
                const bedsFreed = oldOccupied - newOccupied;
                yield DischargeHistory_1.default.create({
                    hospitalId,
                    category,
                    patientName: patientName || `Patient #${Math.floor(100 + Math.random() * 900)}`,
                    patientId: `HC-${category.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    reason: reason || 'Treatment Finished / Successful Recovery',
                    bedsFreed,
                    previousOccupied: oldOccupied,
                    newOccupied: newOccupied,
                    dischargedBy: 'Hospital Medical Officer'
                });
            }
            bed.total = total !== undefined ? total : bed.total;
            bed.occupied = newOccupied;
            yield bed.save();
        }
        res.json(bed);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.updateBed = updateBed;
// Record an explicit patient discharge
const recordPatientDischarge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId } = req.params;
        const { category, patientName, reason, bedsFreed } = req.body;
        const count = bedsFreed ? parseInt(bedsFreed, 10) : 1;
        let bed = yield Bed_1.default.findOne({ hospitalId, category });
        if (!bed) {
            bed = yield Bed_1.default.create({ hospitalId, category, total: 20, occupied: 10 });
        }
        const previousOccupied = bed.occupied;
        const newOccupied = Math.max(0, bed.occupied - count);
        bed.occupied = newOccupied;
        yield bed.save();
        const discharge = yield DischargeHistory_1.default.create({
            hospitalId,
            category,
            patientName: (patientName === null || patientName === void 0 ? void 0 : patientName.trim()) || `Patient #${Math.floor(100 + Math.random() * 900)}`,
            patientId: `HC-${category.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
            reason: (reason === null || reason === void 0 ? void 0 : reason.trim()) || 'Medical Stabilization & Recovery Complete',
            bedsFreed: count,
            previousOccupied,
            newOccupied,
            dischargedBy: 'Hospital In-Charge'
        });
        res.json({
            success: true,
            bed,
            discharge
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.recordPatientDischarge = recordPatientDischarge;
// Fetch discharge history for hospital
const getDischargeHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId } = req.params;
        let history = yield DischargeHistory_1.default.find({ hospitalId }).sort({ createdAt: -1 }).limit(30);
        // If no history exists yet, initialize a couple of initial audit records
        if (history.length === 0) {
            const initialSeed = [
                {
                    hospitalId,
                    category: 'ICU',
                    patientName: 'Ramesh Sharma',
                    patientId: 'HC-IC-4012',
                    reason: 'Cardiac Recovery & Step-Down Transfer',
                    bedsFreed: 1,
                    previousOccupied: 13,
                    newOccupied: 12,
                    dischargedBy: 'Dr. Vivek Menon (ICU Lead)',
                    createdAt: new Date(Date.now() - 1000 * 60 * 45) // 45 mins ago
                },
                {
                    hospitalId,
                    category: 'Emergency',
                    patientName: 'Priya Sundaram',
                    patientId: 'HC-EM-8821',
                    reason: 'Trauma Stabilized & Outpatient Discharge',
                    bedsFreed: 1,
                    previousOccupied: 16,
                    newOccupied: 15,
                    dischargedBy: 'Dr. Sarah Khan (ER Duty)',
                    createdAt: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
                },
                {
                    hospitalId,
                    category: 'General',
                    patientName: 'Anil Kumar',
                    patientId: 'HC-GE-3319',
                    reason: 'Post-Surgery Full Recovery',
                    bedsFreed: 1,
                    previousOccupied: 27,
                    newOccupied: 26,
                    dischargedBy: 'Dr. Arun Patel',
                    createdAt: new Date(Date.now() - 1000 * 60 * 360) // 6 hours ago
                }
            ];
            history = yield DischargeHistory_1.default.insertMany(initialSeed);
        }
        res.json(history);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getDischargeHistory = getDischargeHistory;
