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
// @ts-nocheck
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./models/User"));
const Hospital_1 = __importDefault(require("./models/Hospital"));
const Bed_1 = __importDefault(require("./models/Bed"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect-new';
const seedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB for complete seeding');
        const commonPassword = 'password123';
        const passwordHash = yield bcrypt_1.default.hash(commonPassword, 10);
        // 1. Super Admin
        let superAdmin = yield User_1.default.findOne({ email: 'admin@admin.com' });
        if (!superAdmin) {
            superAdmin = yield User_1.default.create({
                email: 'admin@admin.com',
                passwordHash,
                role: 'super_admin',
                fullName: 'Dr. Rajesh Sharma',
                phone: '+91 98450 11223',
                designation: 'Chief Regional Health Controller',
                department: 'Emergency Healthcare Directorate',
                address: 'HQ Administrative Block, Health Secretariat, Bengaluru'
            });
            console.log('Created Super Admin: admin@admin.com');
        }
        else {
            superAdmin.fullName = 'Dr. Rajesh Sharma';
            superAdmin.phone = '+91 98450 11223';
            superAdmin.designation = 'Chief Regional Health Controller';
            superAdmin.department = 'Emergency Healthcare Directorate';
            superAdmin.address = 'HQ Administrative Block, Health Secretariat, Bengaluru';
            yield superAdmin.save();
            console.log('Updated Super Admin profile: admin@admin.com');
        }
        // 2. Patient User
        let patient = yield User_1.default.findOne({ email: 'patient@example.com' });
        if (!patient) {
            patient = yield User_1.default.create({
                email: 'patient@example.com',
                passwordHash,
                role: 'patient',
                fullName: 'Rahul Verma',
                phone: '+91 97421 88990',
                bloodGroup: 'O+',
                gender: 'Male',
                age: 28,
                dateOfBirth: '1998-05-14',
                address: 'Flat 402, Green Glen Towers, Bellandur, Bengaluru',
                emergencyContactName: 'Priya Verma (Spouse)',
                emergencyContactPhone: '+91 97421 88991',
                allergies: 'Penicillin, Shellfish',
                chronicConditions: 'Mild Asthma'
            });
            console.log('Created Patient: patient@example.com');
        }
        else {
            patient.fullName = 'Rahul Verma';
            patient.phone = '+91 97421 88990';
            patient.bloodGroup = 'O+';
            patient.gender = 'Male';
            patient.age = 28;
            patient.dateOfBirth = '1998-05-14';
            patient.address = 'Flat 402, Green Glen Towers, Bellandur, Bengaluru';
            patient.emergencyContactName = 'Priya Verma (Spouse)';
            patient.emergencyContactPhone = '+91 97421 88991';
            patient.allergies = 'Penicillin, Shellfish';
            patient.chronicConditions = 'Mild Asthma';
            yield patient.save();
            console.log('Updated Patient profile: patient@example.com');
        }
        // 3. Approved Hospital 1: CPR Government General Hospital & Trauma Centre, Kolhapur
        let hospital1 = yield Hospital_1.default.findOne({ adminEmail: 'city@hospital.com' });
        if (!hospital1) {
            hospital1 = yield Hospital_1.default.create({
                name: 'CPR General Hospital & Trauma Centre',
                address: 'Dasara Chowk, Bhavani Mandap Road, Kolhapur',
                contactNumber: '+91 231 264 1125',
                emergencyContact: '+91 231 264 1911',
                lat: 16.6956,
                lng: 74.2274,
                category: 'Government Tertiary Care & Trauma Center',
                city: 'Kolhapur',
                website: 'https://cprkolhapur.gov.in',
                totalBeds: 150,
                icuBeds: 25,
                adminEmail: 'city@hospital.com',
                status: 'approved'
            });
            console.log('Created Hospital: CPR Hospital Kolhapur');
        }
        else {
            hospital1.name = 'CPR General Hospital & Trauma Centre';
            hospital1.address = 'Dasara Chowk, Bhavani Mandap Road, Kolhapur';
            hospital1.contactNumber = '+91 231 264 1125';
            hospital1.emergencyContact = '+91 231 264 1911';
            hospital1.lat = 16.6956;
            hospital1.lng = 74.2274;
            hospital1.category = 'Government Tertiary Care & Trauma Center';
            hospital1.city = 'Kolhapur';
            hospital1.totalBeds = 150;
            hospital1.icuBeds = 25;
            hospital1.status = 'approved';
            yield hospital1.save();
        }
        // Hospital 1 Admin User
        let hospitalAdmin1 = yield User_1.default.findOne({ email: 'city@hospital.com' });
        if (!hospitalAdmin1) {
            hospitalAdmin1 = yield User_1.default.create({
                email: 'city@hospital.com',
                passwordHash,
                role: 'hospital_admin',
                hospitalId: hospital1._id,
                fullName: 'Dr. Ananya Sen',
                phone: '+91 231 264 1126',
                designation: 'Chief Medical Superintendent',
                department: 'Critical Care & Emergency Operations',
                licenseNumber: 'MH-MED-REG-44910'
            });
            console.log('Created Hospital Admin: city@hospital.com');
        }
        else {
            hospitalAdmin1.hospitalId = hospital1._id;
            hospitalAdmin1.fullName = 'Dr. Ananya Sen';
            hospitalAdmin1.phone = '+91 231 264 1126';
            hospitalAdmin1.designation = 'Chief Medical Superintendent';
            hospitalAdmin1.department = 'Critical Care & Emergency Operations';
            hospitalAdmin1.licenseNumber = 'MH-MED-REG-44910';
            yield hospitalAdmin1.save();
        }
        // Seed Beds for Hospital 1
        const bedCategories = ['ICU', 'General', 'Emergency', 'Ventilator'];
        for (const cat of bedCategories) {
            let existingBed = yield Bed_1.default.findOne({ hospitalId: hospital1._id, category: cat });
            const total = cat === 'ICU' ? 25 : cat === 'Ventilator' ? 20 : cat === 'Emergency' ? 30 : 75;
            const occupied = cat === 'ICU' ? 15 : cat === 'Ventilator' ? 14 : cat === 'Emergency' ? 16 : 47;
            if (!existingBed) {
                yield Bed_1.default.create({ hospitalId: hospital1._id, category: cat, total, occupied });
            }
            else {
                existingBed.total = total;
                existingBed.occupied = occupied;
                yield existingBed.save();
            }
        }
        // 4. Approved Hospital 2: Aster Aadhar Hospital, Kolhapur
        let hospital2 = yield Hospital_1.default.findOne({ adminEmail: 'metro@hospital.com' });
        if (!hospital2) {
            hospital2 = yield Hospital_1.default.create({
                name: 'Aster Aadhar Hospital',
                address: 'Near Kadamwadi Phata, Shastri Nagar, Kolhapur',
                contactNumber: '+91 231 662 2555',
                emergencyContact: '+91 231 662 2911',
                lat: 16.7112,
                lng: 74.2480,
                category: 'Multi-Specialty & Cardiac Care',
                city: 'Kolhapur',
                website: 'https://asterkolhapur.care',
                totalBeds: 110,
                icuBeds: 25,
                adminEmail: 'metro@hospital.com',
                status: 'approved'
            });
            console.log('Created Hospital: Aster Aadhar Hospital Kolhapur');
        }
        else {
            hospital2.name = 'Aster Aadhar Hospital';
            hospital2.address = 'Near Kadamwadi Phata, Shastri Nagar, Kolhapur';
            hospital2.contactNumber = '+91 231 662 2555';
            hospital2.emergencyContact = '+91 231 662 2911';
            hospital2.lat = 16.7112;
            hospital2.lng = 74.2480;
            hospital2.category = 'Multi-Specialty & Cardiac Care';
            hospital2.city = 'Kolhapur';
            hospital2.totalBeds = 110;
            hospital2.icuBeds = 25;
            hospital2.status = 'approved';
            yield hospital2.save();
        }
        let hospitalAdmin2 = yield User_1.default.findOne({ email: 'metro@hospital.com' });
        if (!hospitalAdmin2) {
            hospitalAdmin2 = yield User_1.default.create({
                email: 'metro@hospital.com',
                passwordHash,
                role: 'hospital_admin',
                hospitalId: hospital2._id,
                fullName: 'Dr. Vikramaditya Rao',
                phone: '+91 231 662 2556',
                designation: 'Head of Emergency Medicine',
                department: 'Emergency & Disaster Response',
                licenseNumber: 'MH-MED-REG-61204'
            });
        }
        else {
            hospitalAdmin2.hospitalId = hospital2._id;
            hospitalAdmin2.fullName = 'Dr. Vikramaditya Rao';
            hospitalAdmin2.phone = '+91 231 662 2556';
            hospitalAdmin2.designation = 'Head of Emergency Medicine';
            hospitalAdmin2.department = 'Emergency & Disaster Response';
            hospitalAdmin2.licenseNumber = 'MH-MED-REG-61204';
            yield hospitalAdmin2.save();
        }
        for (const cat of bedCategories) {
            let existingBed = yield Bed_1.default.findOne({ hospitalId: hospital2._id, category: cat });
            const total = cat === 'ICU' ? 25 : cat === 'Ventilator' ? 15 : cat === 'Emergency' ? 20 : 50;
            const occupied = cat === 'ICU' ? 16 : cat === 'Ventilator' ? 11 : cat === 'Emergency' ? 12 : 28;
            if (!existingBed) {
                yield Bed_1.default.create({ hospitalId: hospital2._id, category: cat, total, occupied });
            }
            else {
                existingBed.total = total;
                existingBed.occupied = occupied;
                yield existingBed.save();
            }
        }
        // 5. Approved Hospital 3: D. Y. Patil Medical College Hospital, Kolhapur
        let hospital3 = yield Hospital_1.default.findOne({ adminEmail: 'dypatil@hospital.com' });
        if (!hospital3) {
            hospital3 = yield Hospital_1.default.create({
                name: 'D. Y. Patil Medical College Hospital',
                address: 'Line Bazaar, Kasaba Bawada Road, Kolhapur',
                contactNumber: '+91 231 260 1234',
                emergencyContact: '+91 231 260 1911',
                lat: 16.7185,
                lng: 74.2541,
                category: 'Super-Specialty Medical & Research Hospital',
                city: 'Kolhapur',
                website: 'https://dypatilkolhapur.edu',
                totalBeds: 140,
                icuBeds: 30,
                adminEmail: 'dypatil@hospital.com',
                status: 'approved'
            });
            console.log('Created Hospital: D. Y. Patil Hospital Kolhapur');
        }
        else {
            hospital3.name = 'D. Y. Patil Medical College Hospital';
            hospital3.address = 'Line Bazaar, Kasaba Bawada Road, Kolhapur';
            hospital3.contactNumber = '+91 231 260 1234';
            hospital3.emergencyContact = '+91 231 260 1911';
            hospital3.lat = 16.7185;
            hospital3.lng = 74.2541;
            hospital3.city = 'Kolhapur';
            hospital3.totalBeds = 140;
            hospital3.icuBeds = 30;
            hospital3.status = 'approved';
            yield hospital3.save();
        }
        for (const cat of bedCategories) {
            let existingBed = yield Bed_1.default.findOne({ hospitalId: hospital3._id, category: cat });
            const total = cat === 'ICU' ? 30 : cat === 'Ventilator' ? 20 : cat === 'Emergency' ? 25 : 65;
            const occupied = cat === 'ICU' ? 18 : cat === 'Ventilator' ? 15 : cat === 'Emergency' ? 15 : 40;
            if (!existingBed) {
                yield Bed_1.default.create({ hospitalId: hospital3._id, category: cat, total, occupied });
            }
            else {
                existingBed.total = total;
                existingBed.occupied = occupied;
                yield existingBed.save();
            }
        }
        // 6. Approved Hospital 4: Apple Saraswati Multispeciality Hospital, Kolhapur
        let hospital4 = yield Hospital_1.default.findOne({ adminEmail: 'apple@hospital.com' });
        if (!hospital4) {
            hospital4 = yield Hospital_1.default.create({
                name: 'Apple Saraswati Multispeciality Hospital',
                address: 'Station Road, Near Central Bus Stand (CBS), Kolhapur',
                contactNumber: '+91 231 265 8900',
                emergencyContact: '+91 231 265 8911',
                lat: 16.7042,
                lng: 74.2389,
                category: 'Critical Care & Emergency Surgery',
                city: 'Kolhapur',
                totalBeds: 95,
                icuBeds: 20,
                adminEmail: 'apple@hospital.com',
                status: 'approved'
            });
            console.log('Created Hospital: Apple Saraswati Hospital Kolhapur');
        }
        else {
            hospital4.name = 'Apple Saraswati Multispeciality Hospital';
            hospital4.address = 'Station Road, Near Central Bus Stand (CBS), Kolhapur';
            hospital4.contactNumber = '+91 231 265 8900';
            hospital4.emergencyContact = '+91 231 265 8911';
            hospital4.lat = 16.7042;
            hospital4.lng = 74.2389;
            hospital4.city = 'Kolhapur';
            hospital4.totalBeds = 95;
            hospital4.icuBeds = 20;
            hospital4.status = 'approved';
            yield hospital4.save();
        }
        for (const cat of bedCategories) {
            let existingBed = yield Bed_1.default.findOne({ hospitalId: hospital4._id, category: cat });
            const total = cat === 'ICU' ? 20 : cat === 'Ventilator' ? 12 : cat === 'Emergency' ? 18 : 45;
            const occupied = cat === 'ICU' ? 13 : cat === 'Ventilator' ? 8 : cat === 'Emergency' ? 10 : 26;
            if (!existingBed) {
                yield Bed_1.default.create({ hospitalId: hospital4._id, category: cat, total, occupied });
            }
            else {
                existingBed.total = total;
                existingBed.occupied = occupied;
                yield existingBed.save();
            }
        }
        // 7. Approved Hospital 5: Swastik Hospital & Critical Care Centre, Kolhapur
        let hospital5 = yield Hospital_1.default.findOne({ adminEmail: 'apex@hospital.com' });
        if (!hospital5) {
            hospital5 = yield Hospital_1.default.create({
                name: 'Swastik Hospital & Critical Care Centre',
                address: '2nd Lane, Tarabai Park, Kolhapur',
                contactNumber: '+91 231 266 7788',
                emergencyContact: '+91 231 266 7911',
                lat: 16.7140,
                lng: 74.2325,
                category: 'Intensive Care & Emergency Trauma Unit',
                city: 'Kolhapur',
                totalBeds: 80,
                icuBeds: 18,
                adminEmail: 'apex@hospital.com',
                status: 'approved'
            });
            console.log('Created Hospital: Swastik Hospital Kolhapur');
        }
        else {
            hospital5.name = 'Swastik Hospital & Critical Care Centre';
            hospital5.address = '2nd Lane, Tarabai Park, Kolhapur';
            hospital5.contactNumber = '+91 231 266 7788';
            hospital5.emergencyContact = '+91 231 266 7911';
            hospital5.lat = 16.7140;
            hospital5.lng = 74.2325;
            hospital5.city = 'Kolhapur';
            hospital5.totalBeds = 80;
            hospital5.icuBeds = 18;
            hospital5.status = 'approved';
            yield hospital5.save();
        }
        for (const cat of bedCategories) {
            let existingBed = yield Bed_1.default.findOne({ hospitalId: hospital5._id, category: cat });
            const total = cat === 'ICU' ? 18 : cat === 'Ventilator' ? 8 : cat === 'Emergency' ? 14 : 40;
            const occupied = cat === 'ICU' ? 12 : cat === 'Ventilator' ? 5 : cat === 'Emergency' ? 8 : 24;
            if (!existingBed) {
                yield Bed_1.default.create({ hospitalId: hospital5._id, category: cat, total, occupied });
            }
            else {
                existingBed.total = total;
                existingBed.occupied = occupied;
                yield existingBed.save();
            }
        }
        // 8. Approved Hospital 6: Sahyadri Hospital, Kolhapur
        let hospital6 = yield Hospital_1.default.findOne({ adminEmail: 'sahyadri@hospital.com' });
        if (!hospital6) {
            hospital6 = yield Hospital_1.default.create({
                name: 'Sahyadri Hospital',
                address: 'Cyber Chowk, CSIBER Colony, Rajarampuri, Kolhapur',
                contactNumber: '+91 231 253 9999',
                emergencyContact: '+91 231 253 9911',
                lat: 16.6908,
                lng: 74.2415,
                category: 'Tertiary Care & Cardiac Sciences',
                city: 'Kolhapur',
                website: 'https://sahyadrihospital.com',
                totalBeds: 100,
                icuBeds: 22,
                adminEmail: 'sahyadri@hospital.com',
                status: 'approved'
            });
            console.log('Created Hospital: Sahyadri Hospital Kolhapur');
        }
        else {
            hospital6.name = 'Sahyadri Hospital';
            hospital6.address = 'Cyber Chowk, CSIBER Colony, Rajarampuri, Kolhapur';
            hospital6.contactNumber = '+91 231 253 9999';
            hospital6.emergencyContact = '+91 231 253 9911';
            hospital6.lat = 16.6908;
            hospital6.lng = 74.2415;
            hospital6.city = 'Kolhapur';
            hospital6.totalBeds = 100;
            hospital6.icuBeds = 22;
            hospital6.status = 'approved';
            yield hospital6.save();
        }
        for (const cat of bedCategories) {
            let existingBed = yield Bed_1.default.findOne({ hospitalId: hospital6._id, category: cat });
            const total = cat === 'ICU' ? 22 : cat === 'Ventilator' ? 12 : cat === 'Emergency' ? 18 : 48;
            const occupied = cat === 'ICU' ? 14 : cat === 'Ventilator' ? 8 : cat === 'Emergency' ? 11 : 28;
            if (!existingBed) {
                yield Bed_1.default.create({ hospitalId: hospital6._id, category: cat, total, occupied });
            }
            else {
                existingBed.total = total;
                existingBed.occupied = occupied;
                yield existingBed.save();
            }
        }
        // 9. Approved Hospital 7: Surya Multispeciality Hospital & Trauma Care, Kolhapur
        let hospital7 = yield Hospital_1.default.findOne({ adminEmail: 'surya@hospital.com' });
        if (!hospital7) {
            hospital7 = yield Hospital_1.default.create({
                name: 'Surya Multispeciality Hospital',
                address: '1st Lane, Poorna Nagar, Rajarampuri, Kolhapur',
                contactNumber: '+91 231 252 8800',
                emergencyContact: '+91 231 252 8911',
                lat: 16.6985,
                lng: 74.2440,
                category: 'Trauma Care & Orthopedic Surgery',
                city: 'Kolhapur',
                totalBeds: 85,
                icuBeds: 18,
                adminEmail: 'surya@hospital.com',
                status: 'approved'
            });
            console.log('Created Hospital: Surya Hospital Kolhapur');
        }
        else {
            hospital7.name = 'Surya Multispeciality Hospital';
            hospital7.address = '1st Lane, Poorna Nagar, Rajarampuri, Kolhapur';
            hospital7.contactNumber = '+91 231 252 8800';
            hospital7.emergencyContact = '+91 231 252 8911';
            hospital7.lat = 16.6985;
            hospital7.lng = 74.2440;
            hospital7.city = 'Kolhapur';
            hospital7.totalBeds = 85;
            hospital7.icuBeds = 18;
            hospital7.status = 'approved';
            yield hospital7.save();
        }
        for (const cat of bedCategories) {
            let existingBed = yield Bed_1.default.findOne({ hospitalId: hospital7._id, category: cat });
            const total = cat === 'ICU' ? 18 : cat === 'Ventilator' ? 10 : cat === 'Emergency' ? 15 : 42;
            const occupied = cat === 'ICU' ? 11 : cat === 'Ventilator' ? 6 : cat === 'Emergency' ? 9 : 24;
            if (!existingBed) {
                yield Bed_1.default.create({ hospitalId: hospital7._id, category: cat, total, occupied });
            }
            else {
                existingBed.total = total;
                existingBed.occupied = occupied;
                yield existingBed.save();
            }
        }
        // 10. Approved Hospital 8: Vasantprabha Hospital & Research Institute, Kolhapur
        let hospital8 = yield Hospital_1.default.findOne({ adminEmail: 'vasantprabha@hospital.com' });
        if (!hospital8) {
            hospital8 = yield Hospital_1.default.create({
                name: 'Vasantprabha Hospital & Research Institute',
                address: 'Station Road, Near Kawala Naka, Shahupuri, Kolhapur',
                contactNumber: '+91 231 265 4422',
                emergencyContact: '+91 231 265 4911',
                lat: 16.7031,
                lng: 74.2465,
                category: 'Critical Care, Orthopedics & Trauma',
                city: 'Kolhapur',
                totalBeds: 75,
                icuBeds: 16,
                adminEmail: 'vasantprabha@hospital.com',
                status: 'approved'
            });
            console.log('Created Hospital: Vasantprabha Hospital Kolhapur');
        }
        else {
            hospital8.name = 'Vasantprabha Hospital & Research Institute';
            hospital8.address = 'Station Road, Near Kawala Naka, Shahupuri, Kolhapur';
            hospital8.contactNumber = '+91 231 265 4422';
            hospital8.emergencyContact = '+91 231 265 4911';
            hospital8.lat = 16.7031;
            hospital8.lng = 74.2465;
            hospital8.city = 'Kolhapur';
            hospital8.totalBeds = 75;
            hospital8.icuBeds = 16;
            hospital8.status = 'approved';
            yield hospital8.save();
        }
        for (const cat of bedCategories) {
            let existingBed = yield Bed_1.default.findOne({ hospitalId: hospital8._id, category: cat });
            const total = cat === 'ICU' ? 16 : cat === 'Ventilator' ? 8 : cat === 'Emergency' ? 12 : 39;
            const occupied = cat === 'ICU' ? 10 : cat === 'Ventilator' ? 5 : cat === 'Emergency' ? 7 : 23;
            if (!existingBed) {
                yield Bed_1.default.create({ hospitalId: hospital8._id, category: cat, total, occupied });
            }
            else {
                existingBed.total = total;
                existingBed.occupied = occupied;
                yield existingBed.save();
            }
        }
        // 11. Ensure exactly the 8 Prime Kolhapur hospitals remain in the database
        const primeEmails = [
            'city@hospital.com',
            'metro@hospital.com',
            'dypatil@hospital.com',
            'apple@hospital.com',
            'apex@hospital.com',
            'sahyadri@hospital.com',
            'surya@hospital.com',
            'vasantprabha@hospital.com'
        ];
        const hospitalsToRemove = yield Hospital_1.default.find({ adminEmail: { $nin: primeEmails } });
        for (const h of hospitalsToRemove) {
            yield Bed_1.default.deleteMany({ hospitalId: h._id });
            yield User_1.default.deleteMany({ hospitalId: h._id });
        }
        yield Hospital_1.default.deleteMany({ adminEmail: { $nin: primeEmails } });
        // Ensure all 8 Kolhapur hospitals have official Maharashtra licenses and OTP verification
        const primeHospitals = yield Hospital_1.default.find({ adminEmail: { $in: primeEmails } });
        for (let i = 0; i < primeHospitals.length; i++) {
            const h = primeHospitals[i];
            h.status = 'approved';
            h.isOtpVerified = true;
            h.licenseNumber = `MH-KOP-MED-2026-${String(i + 1).padStart(3, '0')}`;
            h.documentName = `${h.name.replace(/[^a-zA-Z0-9]/g, '_')}_Establishment_License.pdf`;
            h.documentType = 'Govt Clinical Establishment License (Class A)';
            h.documentUploadedAt = new Date();
            yield h.save();
        }
        console.log(`Cleaned up extra hospitals. Exactly 8 Prime Kolhapur hospitals active in database with verified status.`);
        console.log('Kolhapur hospitals seeded successfully with complete real-time bed inventory!');
        console.log('Seeding completed successfully with rich profiles and contact numbers!');
        yield mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (err) {
        console.error('Error seeding database:', err);
        yield mongoose_1.default.disconnect();
        process.exit(1);
    }
});
seedDatabase();
