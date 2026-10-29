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
exports.deleteHospital = exports.updateHospital = exports.updateHospitalStatus = exports.createHospital = exports.getAllHospitals = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const Hospital_1 = __importDefault(require("../models/Hospital"));
const User_1 = __importDefault(require("../models/User"));
const Bed_1 = __importDefault(require("../models/Bed"));
const BloodInventory_1 = __importDefault(require("../models/BloodInventory"));
const getAllHospitals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawHospitals = yield Hospital_1.default.find({}).sort({ createdAt: -1 }).lean();
        const hospitalsWithBeds = yield Promise.all(rawHospitals.map((hospital) => __awaiter(void 0, void 0, void 0, function* () {
            let beds = yield Bed_1.default.find({ hospitalId: hospital._id }).lean();
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
exports.getAllHospitals = getAllHospitals;
const createHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, contactNumber, emergencyContact, adminEmail, password, lat, lng, category, city, totalBeds, icuBeds } = req.body;
        if (!name || !address || !adminEmail) {
            return res.status(400).json({ error: 'Hospital Name, Address, and Admin Email are required.' });
        }
        // Check if hospital with this email or name already exists
        const existingHospital = yield Hospital_1.default.findOne({
            $or: [{ adminEmail: adminEmail.toLowerCase().trim() }, { name: name.trim() }]
        });
        if (existingHospital) {
            return res.status(400).json({ error: 'A hospital with this name or admin email already exists in the registry.' });
        }
        // 1. Create Hospital with status 'approved' (Admin Authority)
        const hospital = yield Hospital_1.default.create({
            name: name.trim(),
            address: address.trim(),
            contactNumber: (contactNumber === null || contactNumber === void 0 ? void 0 : contactNumber.trim()) || '+91 231 264 1125',
            emergencyContact: (emergencyContact === null || emergencyContact === void 0 ? void 0 : emergencyContact.trim()) || '+91 108',
            adminEmail: adminEmail.toLowerCase().trim(),
            lat: lat ? parseFloat(lat) : 16.7050,
            lng: lng ? parseFloat(lng) : 74.2433,
            category: (category === null || category === void 0 ? void 0 : category.trim()) || 'Multi-Specialty & Trauma Care',
            city: (city === null || city === void 0 ? void 0 : city.trim()) || 'Kolhapur',
            totalBeds: totalBeds ? parseInt(totalBeds, 10) : 50,
            icuBeds: icuBeds ? parseInt(icuBeds, 10) : 15,
            status: 'approved', // Direct super admin authority
        });
        // 2. Create or link Hospital Admin user account
        const adminPassword = (password === null || password === void 0 ? void 0 : password.trim()) || 'password123';
        const passwordHash = yield bcrypt_1.default.hash(adminPassword, 10);
        let user = yield User_1.default.findOne({ email: adminEmail.toLowerCase().trim() });
        if (!user) {
            user = yield User_1.default.create({
                email: adminEmail.toLowerCase().trim(),
                passwordHash,
                role: 'hospital_admin',
                hospitalId: hospital._id,
                fullName: `${name} Administrator`,
                phone: contactNumber || '+91 80 2345 6789',
                designation: 'Medical Superintendent / Administrator',
                department: 'Hospital Operations'
            });
        }
        else {
            user.role = 'hospital_admin';
            user.hospitalId = hospital._id;
            user.passwordHash = passwordHash;
            yield user.save();
        }
        // 3. Initialize default Bed allocations
        const bedCategories = ['ICU', 'General', 'Emergency', 'Ventilator'];
        const totalCount = totalBeds ? parseInt(totalBeds, 10) : 50;
        const icuCount = icuBeds ? parseInt(icuBeds, 10) : 15;
        for (const cat of bedCategories) {
            const existingBed = yield Bed_1.default.findOne({ hospitalId: hospital._id, category: cat });
            if (!existingBed) {
                const catTotal = cat === 'ICU' ? icuCount : cat === 'Ventilator' ? Math.round(icuCount * 0.5) : cat === 'Emergency' ? Math.round(totalCount * 0.3) : totalCount;
                const catOccupied = Math.round(catTotal * 0.4);
                yield Bed_1.default.create({
                    hospitalId: hospital._id,
                    category: cat,
                    total: catTotal,
                    occupied: catOccupied
                });
            }
        }
        // 4. Initialize default Blood inventory
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        for (const group of bloodGroups) {
            const existingBlood = yield BloodInventory_1.default.findOne({ hospitalId: hospital._id, bloodGroup: group });
            if (!existingBlood) {
                yield BloodInventory_1.default.create({
                    hospitalId: hospital._id,
                    bloodGroup: group,
                    units: 10,
                    status: 'Available',
                    lastUpdated: new Date()
                });
            }
        }
        res.status(201).json({
            message: 'Hospital registered, authorized, and operational in registry.',
            hospital,
            adminCredentials: {
                email: adminEmail,
                password: adminPassword
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.createHospital = createHospital;
const updateHospitalStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const updatePayload = { status };
        if (rejectionReason) {
            updatePayload.rejectionReason = rejectionReason;
        }
        const hospital = yield Hospital_1.default.findByIdAndUpdate(id, updatePayload, { new: true });
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found' });
        }
        // Step 5: When approved by admin, ensure wards, beds, and blood units are ready
        if (status === 'approved') {
            const bedCategories = ['ICU', 'General', 'Emergency', 'Ventilator'];
            const totalCount = hospital.totalBeds || 50;
            const icuCount = hospital.icuBeds || 15;
            for (const cat of bedCategories) {
                const existingBed = yield Bed_1.default.findOne({ hospitalId: hospital._id, category: cat });
                if (!existingBed) {
                    const catTotal = cat === 'ICU' ? icuCount : cat === 'Ventilator' ? Math.round(icuCount * 0.5) : cat === 'Emergency' ? Math.round(totalCount * 0.3) : totalCount;
                    const catOccupied = Math.round(catTotal * 0.35);
                    yield Bed_1.default.create({
                        hospitalId: hospital._id,
                        category: cat,
                        total: catTotal,
                        occupied: catOccupied
                    });
                }
            }
            const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            for (const group of bloodGroups) {
                const existingBlood = yield BloodInventory_1.default.findOne({ hospitalId: hospital._id, bloodGroup: group });
                if (!existingBlood) {
                    yield BloodInventory_1.default.create({
                        hospitalId: hospital._id,
                        bloodGroup: group,
                        units: 12,
                        status: 'Available',
                        lastUpdated: new Date()
                    });
                }
            }
        }
        console.log(`[ADMIN-STEP-5] Super Admin updated hospital "${hospital.name}" status to "${status}".`);
        res.json(hospital);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.updateHospitalStatus = updateHospitalStatus;
const updateHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const hospital = yield Hospital_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found' });
        }
        res.json(hospital);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.updateHospital = updateHospital;
const deleteHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const hospital = yield Hospital_1.default.findByIdAndDelete(id);
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found' });
        }
        // Clean up beds and blood inventory
        yield Bed_1.default.deleteMany({ hospitalId: id });
        yield BloodInventory_1.default.deleteMany({ hospitalId: id });
        res.json({ message: 'Hospital and associated resources removed successfully.' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.deleteHospital = deleteHospital;
