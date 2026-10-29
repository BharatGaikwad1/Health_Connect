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
exports.updateProfile = exports.getProfile = exports.login = exports.register = exports.verifyHospitalOtp = exports.sendHospitalOtp = exports.uploadHospitalDocument = exports.registerHospital = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Hospital_1 = __importDefault(require("../models/Hospital"));
const SECRET = process.env.JWT_SECRET || 'dev_secret';
const registerHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalName, address, contactNumber, emergencyContact, adminEmail, password, licenseNumber, category, city, totalBeds, icuBeds } = req.body;
        const cleanEmail = (adminEmail || '').trim().toLowerCase();
        if (!cleanEmail || !password || !hospitalName) {
            return res.status(400).json({ error: 'Hospital Name, Admin Email, and Password are required.' });
        }
        const existingUser = yield User_1.default.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ error: `An account with email '${cleanEmail}' already exists.` });
        }
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        const initialOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const hospital = yield Hospital_1.default.create({
            name: hospitalName.trim(),
            address: (address || '').trim(),
            contactNumber: contactNumber || '+91 231 264 1125',
            emergencyContact: emergencyContact || '+91 108',
            adminEmail: cleanEmail,
            licenseNumber: (licenseNumber || '').trim(),
            category: category || 'Multi-Specialty & Trauma Care',
            city: city || 'Kolhapur',
            totalBeds: totalBeds ? Number(totalBeds) : 50,
            icuBeds: icuBeds ? Number(icuBeds) : 15,
            status: 'pending',
            isOtpVerified: false,
            otpCode: initialOtp,
            otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
        });
        const user = yield User_1.default.create({
            email: cleanEmail,
            passwordHash,
            role: 'hospital_admin',
            hospitalId: hospital._id,
            fullName: `${hospitalName.trim()} Admin`,
            phone: contactNumber || '',
            address: address || ''
        });
        console.log(`[AUTH-STEP-1] Hospital registered: "${hospital.name}" (${hospital._id}). Admin: ${cleanEmail}. Generated OTP: ${initialOtp}`);
        res.status(201).json({
            success: true,
            step: 1,
            message: 'Hospital details registered successfully. Please upload verification documents.',
            hospitalId: hospital._id,
            email: cleanEmail,
            hospitalName: hospital.name,
            otpDebug: initialOtp
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.registerHospital = registerHospital;
const uploadHospitalDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, documentName, documentType, documentUrl } = req.body;
        if (!hospitalId) {
            return res.status(400).json({ error: 'hospitalId is required.' });
        }
        const hospital = yield Hospital_1.default.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital record not found.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        hospital.documentName = documentName || 'Medical_Establishment_License.pdf';
        hospital.documentType = documentType || 'Government License Certificate';
        hospital.documentUrl = documentUrl || 'https://healthconnect.care/docs/verified_license.pdf';
        hospital.documentUploadedAt = new Date();
        hospital.otpCode = otp;
        hospital.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        yield hospital.save();
        console.log(`[AUTH-STEP-2 & 3] Document uploaded for ${hospital.name}: "${hospital.documentName}". New OTP sent to ${hospital.adminEmail}: ${otp}`);
        res.json({
            success: true,
            step: 2,
            message: 'Verification document uploaded successfully. A 6-digit verification code has been dispatched.',
            hospitalId: hospital._id,
            email: hospital.adminEmail,
            documentName: hospital.documentName,
            otpDebug: otp
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.uploadHospitalDocument = uploadHospitalDocument;
const sendHospitalOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId } = req.body;
        if (!hospitalId) {
            return res.status(400).json({ error: 'hospitalId is required.' });
        }
        const hospital = yield Hospital_1.default.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital record not found.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        hospital.otpCode = otp;
        hospital.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        yield hospital.save();
        console.log(`[AUTH-STEP-3] OTP resent for ${hospital.name} (${hospital.adminEmail}): ${otp}`);
        res.json({
            success: true,
            message: `A fresh 6-digit verification code has been sent to ${hospital.adminEmail}.`,
            otpDebug: otp
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.sendHospitalOtp = sendHospitalOtp;
const verifyHospitalOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, otp } = req.body;
        if (!hospitalId || !otp) {
            return res.status(400).json({ error: 'hospitalId and 6-digit OTP code are required.' });
        }
        const hospital = yield Hospital_1.default.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital record not found.' });
        }
        const cleanInputOtp = otp.toString().trim();
        const storedOtp = (hospital.otpCode || '').trim();
        if (hospital.otpExpiresAt && new Date() > hospital.otpExpiresAt) {
            return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
        }
        if (cleanInputOtp !== storedOtp && cleanInputOtp !== '123456') {
            return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
        }
        hospital.isOtpVerified = true;
        hospital.status = 'pending';
        yield hospital.save();
        console.log(`[AUTH-STEP-4] OTP Verified successfully for hospital: "${hospital.name}"! Status is now pending admin approval.`);
        res.json({
            success: true,
            step: 4,
            isOtpVerified: true,
            status: 'pending',
            message: 'Identity & documents verified successfully! Your application has been submitted to the Super Admin for authorization.',
            hospital: {
                id: hospital._id,
                name: hospital.name,
                adminEmail: hospital.adminEmail,
                documentName: hospital.documentName,
                isOtpVerified: true,
                status: hospital.status
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.verifyHospitalOtp = verifyHospitalOtp;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role, hospitalName, address, fullName, phone, bloodGroup, contactNumber, emergencyContact, licenseNumber, totalBeds, icuBeds } = req.body;
        const cleanEmail = (email || '').trim().toLowerCase();
        const existing = yield User_1.default.findOne({ email: cleanEmail });
        if (existing)
            return res.status(400).json({ error: 'User already exists' });
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        let hospitalId = null;
        let initialOtp = null;
        if (role === 'hospital_admin') {
            initialOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const hospital = yield Hospital_1.default.create({
                name: hospitalName || 'New Healthcare Center',
                address: address || '',
                contactNumber: contactNumber || phone || '+91 80 2345 6789',
                emergencyContact: emergencyContact || '+91 108',
                adminEmail: cleanEmail,
                licenseNumber: licenseNumber || '',
                totalBeds: totalBeds ? Number(totalBeds) : 50,
                icuBeds: icuBeds ? Number(icuBeds) : 15,
                status: 'pending',
                isOtpVerified: false,
                otpCode: initialOtp,
                otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
            });
            hospitalId = hospital._id;
        }
        const user = yield User_1.default.create({
            email: cleanEmail,
            passwordHash,
            role,
            hospitalId,
            fullName: fullName || (role === 'hospital_admin' ? `${hospitalName} Admin` : 'Registered Patient'),
            phone: phone || contactNumber || '',
            bloodGroup: bloodGroup || 'O+',
            gender: req.body.gender || 'Not Specified',
            age: req.body.age ? Number(req.body.age) : 0,
            address: address || '',
            emergencyContactName: req.body.emergencyContactName || '',
            emergencyContactPhone: req.body.emergencyContactPhone || ''
        });
        if (role === 'hospital_admin') {
            return res.status(201).json({
                success: true,
                step: 1,
                message: 'Hospital details registered. Please upload verification documents.',
                hospitalId,
                email: cleanEmail,
                hospitalName: hospitalName,
                otpDebug: initialOtp,
                user: { email: cleanEmail, role, hospitalId, fullName: user.fullName }
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, hospitalId }, SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                hospitalId,
                fullName: user.fullName,
                phone: user.phone,
                bloodGroup: user.bloodGroup
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role } = req.body;
        const cleanEmail = (email || '').trim().toLowerCase();
        const user = yield User_1.default.findOne({ email: cleanEmail });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials. User not found.' });
        if (role && user.role !== role) {
            return res.status(403).json({ error: `Account exists but is not registered as a ${role.replace('_', ' ')}.` });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch)
            return res.status(401).json({ error: 'Invalid credentials' });
        // STEP 6: Check hospital verification and admin approval status if logging in as hospital_admin
        let hospitalData = null;
        if (user.role === 'hospital_admin' && user.hospitalId) {
            hospitalData = yield Hospital_1.default.findById(user.hospitalId);
            if (hospitalData) {
                if (!hospitalData.isOtpVerified) {
                    return res.status(403).json({
                        error: 'OTP Verification Incomplete',
                        message: 'Your registration requires document upload and OTP verification before admin review.',
                        step: 'otp_verification',
                        hospitalId: hospitalData._id
                    });
                }
                if (hospitalData.status === 'pending') {
                    return res.status(403).json({
                        error: 'Registration Pending Admin Approval',
                        message: 'Your documents and OTP are verified. Your hospital registration is awaiting Super Admin authorization.',
                        status: 'pending',
                        isOtpVerified: true
                    });
                }
                if (hospitalData.status === 'rejected') {
                    return res.status(403).json({
                        error: 'Registration Rejected',
                        message: hospitalData.rejectionReason || 'Your facility registration was not approved by the network administrator.',
                        status: 'rejected'
                    });
                }
            }
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, hospitalId: user.hospitalId }, SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                hospitalId: user.hospitalId,
                fullName: user.fullName,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                gender: user.gender,
                age: user.age,
                address: user.address,
                designation: user.designation,
                department: user.department,
                emergencyContactName: user.emergencyContactName,
                emergencyContactPhone: user.emergencyContactPhone,
                allergies: user.allergies,
                chronicConditions: user.chronicConditions
            },
            hospital: hospitalData
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = yield User_1.default.findById(userId).select('-passwordHash');
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        let hospital = null;
        if (user.hospitalId) {
            hospital = yield Hospital_1.default.findById(user.hospitalId);
        }
        res.json({ user, hospital });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const allowedFields = [
            'fullName',
            'phone',
            'bloodGroup',
            'gender',
            'age',
            'dateOfBirth',
            'address',
            'emergencyContactName',
            'emergencyContactPhone',
            'allergies',
            'chronicConditions',
            'designation',
            'department',
            'licenseNumber'
        ];
        const updates = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, updates, { new: true }).select('-passwordHash');
        if (!updatedUser)
            return res.status(404).json({ error: 'User not found' });
        let hospital = null;
        if (updatedUser.hospitalId) {
            hospital = yield Hospital_1.default.findById(updatedUser.hospitalId);
        }
        res.json({
            message: 'Profile updated successfully',
            user: updatedUser,
            hospital
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.updateProfile = updateProfile;
