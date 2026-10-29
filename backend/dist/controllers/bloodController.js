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
exports.updateHospitalBlood = exports.getHospitalBlood = void 0;
const BloodInventory_1 = __importDefault(require("../models/BloodInventory"));
const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// Helper to determine status based on units
const calculateStatus = (units) => {
    if (units <= 2)
        return 'Critical';
    if (units <= 5)
        return 'Low Stock';
    if (units >= 25)
        return 'Surplus';
    return 'Available';
};
// Get blood inventory for a specific hospital
const getHospitalBlood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId } = req.params;
        let records = yield BloodInventory_1.default.find({ hospitalId });
        // Seed defaults if hospital has no records initialized yet
        if (records.length === 0) {
            const defaultRecords = ALL_BLOOD_GROUPS.map((group) => ({
                hospitalId,
                bloodGroup: group,
                units: 10,
                status: 'Available',
                lastUpdated: new Date()
            }));
            records = yield BloodInventory_1.default.insertMany(defaultRecords);
        }
        res.json(records);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getHospitalBlood = getHospitalBlood;
// Update specific blood group stock for a hospital
const updateHospitalBlood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, bloodGroup } = req.params;
        const { units } = req.body;
        const parsedUnits = Math.max(0, Number(units) || 0);
        const computedStatus = calculateStatus(parsedUnits);
        let item = yield BloodInventory_1.default.findOne({ hospitalId, bloodGroup });
        if (!item) {
            item = yield BloodInventory_1.default.create({
                hospitalId,
                bloodGroup,
                units: parsedUnits,
                status: computedStatus,
                lastUpdated: new Date()
            });
        }
        else {
            item.units = parsedUnits;
            item.status = computedStatus;
            item.lastUpdated = new Date();
            yield item.save();
        }
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.updateHospitalBlood = updateHospitalBlood;
