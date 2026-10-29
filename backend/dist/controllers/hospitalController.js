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
exports.updateHospitalProfile = exports.getHospitalById = exports.getHospitals = void 0;
const Hospital_1 = __importDefault(require("../models/Hospital"));
const Bed_1 = __importDefault(require("../models/Bed"));
const BED_CATEGORIES = ['ICU', 'General', 'Emergency', 'Ventilator'];
const getHospitals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawHospitals = yield Hospital_1.default.find({ status: 'approved' }).lean();
        const hospitalsWithBeds = yield Promise.all(rawHospitals.map((hospital, idx) => __awaiter(void 0, void 0, void 0, function* () {
            let beds = yield Bed_1.default.find({ hospitalId: hospital._id }).lean();
            // If hospital has no beds yet, initialize standard distribution
            if (!beds || beds.length === 0) {
                const defaultBeds = [
                    { hospitalId: hospital._id, category: 'ICU', total: 20, occupied: 12 },
                    { hospitalId: hospital._id, category: 'General', total: 50, occupied: 26 },
                    { hospitalId: hospital._id, category: 'Emergency', total: 25, occupied: 14 },
                    { hospitalId: hospital._id, category: 'Ventilator', total: 10, occupied: 4 }
                ];
                beds = yield Bed_1.default.insertMany(defaultBeds);
            }
            const bedDetails = beds.map(b => ({
                category: b.category,
                total: b.total || 0,
                occupied: b.occupied || 0,
                available: Math.max(0, (b.total || 0) - (b.occupied || 0))
            }));
            const totalCapacity = bedDetails.reduce((sum, b) => sum + b.total, 0);
            const totalOccupied = bedDetails.reduce((sum, b) => sum + b.occupied, 0);
            const totalAvailable = Math.max(0, totalCapacity - totalOccupied);
            const icu = bedDetails.find(b => b.category === 'ICU') || { total: 20, occupied: 12, available: 8 };
            const general = bedDetails.find(b => b.category === 'General') || { total: 50, occupied: 26, available: 24 };
            const emergency = bedDetails.find(b => b.category === 'Emergency') || { total: 25, occupied: 14, available: 11 };
            const ventilator = bedDetails.find(b => b.category === 'Ventilator') || { total: 10, occupied: 4, available: 6 };
            return Object.assign(Object.assign({}, hospital), { beds: bedDetails, totalCapacity,
                totalOccupied,
                totalAvailable, icuAvailable: icu.available, icuTotal: icu.total, generalAvailable: general.available, generalTotal: general.total, emergencyAvailable: emergency.available, emergencyTotal: emergency.total, ventilatorAvailable: ventilator.available, ventilatorTotal: ventilator.total });
        })));
        res.json(hospitalsWithBeds);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getHospitals = getHospitals;
const getHospitalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const hospital = yield Hospital_1.default.findById(id).lean();
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found' });
        }
        let beds = yield Bed_1.default.find({ hospitalId: id }).lean();
        if (!beds || beds.length === 0) {
            const defaultBeds = [
                { hospitalId: id, category: 'ICU', total: 20, occupied: 12 },
                { hospitalId: id, category: 'General', total: 50, occupied: 26 },
                { hospitalId: id, category: 'Emergency', total: 25, occupied: 14 },
                { hospitalId: id, category: 'Ventilator', total: 10, occupied: 4 }
            ];
            beds = yield Bed_1.default.insertMany(defaultBeds);
        }
        const bedDetails = beds.map(b => ({
            category: b.category,
            total: b.total || 0,
            occupied: b.occupied || 0,
            available: Math.max(0, (b.total || 0) - (b.occupied || 0))
        }));
        const totalCapacity = bedDetails.reduce((sum, b) => sum + b.total, 0);
        const totalOccupied = bedDetails.reduce((sum, b) => sum + b.occupied, 0);
        const totalAvailable = Math.max(0, totalCapacity - totalOccupied);
        const icu = bedDetails.find(b => b.category === 'ICU') || { total: 20, occupied: 12, available: 8 };
        const general = bedDetails.find(b => b.category === 'General') || { total: 50, occupied: 26, available: 24 };
        const emergency = bedDetails.find(b => b.category === 'Emergency') || { total: 25, occupied: 14, available: 11 };
        const ventilator = bedDetails.find(b => b.category === 'Ventilator') || { total: 10, occupied: 4, available: 6 };
        res.json(Object.assign(Object.assign({}, hospital), { beds: bedDetails, totalCapacity,
            totalOccupied,
            totalAvailable, icuAvailable: icu.available, icuTotal: icu.total, generalAvailable: general.available, generalTotal: general.total, emergencyAvailable: emergency.available, emergencyTotal: emergency.total, ventilatorAvailable: ventilator.available, ventilatorTotal: ventilator.total }));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getHospitalById = getHospitalById;
const updateHospitalProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { contactNumber, emergencyContact, address, name, city, website, category } = req.body;
        const hospital = yield Hospital_1.default.findByIdAndUpdate(id, Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (contactNumber !== undefined && { contactNumber })), (emergencyContact !== undefined && { emergencyContact })), (address !== undefined && { address })), (name !== undefined && { name })), (city !== undefined && { city })), (website !== undefined && { website })), (category !== undefined && { category })), { new: true });
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found' });
        }
        res.json(hospital);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.updateHospitalProfile = updateHospitalProfile;
