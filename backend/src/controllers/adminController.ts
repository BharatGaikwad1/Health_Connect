// @ts-nocheck
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Hospital from '../models/Hospital';
import User from '../models/User';
import Bed from '../models/Bed';
import BloodInventory from '../models/BloodInventory';

export const getAllHospitals = async (req: Request, res: Response) => {
  try {
    const rawHospitals = await Hospital.find({}).sort({ createdAt: -1 }).lean();

    const hospitalsWithBeds = await Promise.all(
      rawHospitals.map(async (hospital) => {
        let beds = await Bed.find({ hospitalId: hospital._id }).lean();

        if (!beds || beds.length === 0) {
          const defaultBeds = [
            { hospitalId: hospital._id, category: 'ICU', total: 20, occupied: 12 },
            { hospitalId: hospital._id, category: 'General', total: 50, occupied: 26 },
            { hospitalId: hospital._id, category: 'Emergency', total: 25, occupied: 14 },
            { hospitalId: hospital._id, category: 'Ventilator', total: 10, occupied: 4 }
          ];
          beds = await Bed.insertMany(defaultBeds);
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

        return {
          ...hospital,
          beds: bedDetails,
          totalCapacity,
          totalOccupied,
          totalAvailable,
          icuAvailable: icu.available,
          icuTotal: icu.total,
          generalAvailable: general.available,
          generalTotal: general.total,
          emergencyAvailable: emergency.available,
          emergencyTotal: emergency.total,
          ventilatorAvailable: ventilator.available,
          ventilatorTotal: ventilator.total,
        };
      })
    );

    res.json(hospitalsWithBeds);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createHospital = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      address, 
      contactNumber, 
      emergencyContact, 
      adminEmail, 
      password, 
      lat, 
      lng, 
      category, 
      city, 
      totalBeds, 
      icuBeds 
    } = req.body;

    if (!name || !address || !adminEmail) {
      return res.status(400).json({ error: 'Hospital Name, Address, and Admin Email are required.' });
    }

    // Check if hospital with this email or name already exists
    const existingHospital = await Hospital.findOne({ 
      $or: [{ adminEmail: adminEmail.toLowerCase().trim() }, { name: name.trim() }] 
    });
    if (existingHospital) {
      return res.status(400).json({ error: 'A hospital with this name or admin email already exists in the registry.' });
    }

    // 1. Create Hospital with status 'approved' (Admin Authority)
    const hospital = await Hospital.create({
      name: name.trim(),
      address: address.trim(),
      contactNumber: contactNumber?.trim() || '+91 231 264 1125',
      emergencyContact: emergencyContact?.trim() || '+91 108',
      adminEmail: adminEmail.toLowerCase().trim(),
      lat: lat ? parseFloat(lat) : 16.7050,
      lng: lng ? parseFloat(lng) : 74.2433,
      category: category?.trim() || 'Multi-Specialty & Trauma Care',
      city: city?.trim() || 'Kolhapur',
      totalBeds: totalBeds ? parseInt(totalBeds, 10) : 50,
      icuBeds: icuBeds ? parseInt(icuBeds, 10) : 15,
      status: 'approved', // Direct super admin authority
    });

    // 2. Create or link Hospital Admin user account
    const adminPassword = password?.trim() || 'password123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    let user = await User.findOne({ email: adminEmail.toLowerCase().trim() });
    if (!user) {
      user = await User.create({
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        role: 'hospital_admin',
        hospitalId: hospital._id,
        fullName: `${name} Administrator`,
        phone: contactNumber || '+91 80 2345 6789',
        designation: 'Medical Superintendent / Administrator',
        department: 'Hospital Operations'
      });
    } else {
      user.role = 'hospital_admin';
      user.hospitalId = hospital._id;
      user.passwordHash = passwordHash;
      await user.save();
    }

    // 3. Initialize default Bed allocations
    const bedCategories: Array<'ICU' | 'General' | 'Emergency' | 'Ventilator'> = ['ICU', 'General', 'Emergency', 'Ventilator'];
    const totalCount = totalBeds ? parseInt(totalBeds, 10) : 50;
    const icuCount = icuBeds ? parseInt(icuBeds, 10) : 15;

    for (const cat of bedCategories) {
      const existingBed = await Bed.findOne({ hospitalId: hospital._id, category: cat });
      if (!existingBed) {
        const catTotal = cat === 'ICU' ? icuCount : cat === 'Ventilator' ? Math.round(icuCount * 0.5) : cat === 'Emergency' ? Math.round(totalCount * 0.3) : totalCount;
        const catOccupied = Math.round(catTotal * 0.4);
        await Bed.create({
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
      const existingBlood = await BloodInventory.findOne({ hospitalId: hospital._id, bloodGroup: group });
      if (!existingBlood) {
        await BloodInventory.create({
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHospitalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    const updatePayload: any = { status };
    if (rejectionReason) {
      updatePayload.rejectionReason = rejectionReason;
    }

    const hospital = await Hospital.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Step 5: When approved by admin, ensure wards, beds, and blood units are ready
    if (status === 'approved') {
      const bedCategories: Array<'ICU' | 'General' | 'Emergency' | 'Ventilator'> = ['ICU', 'General', 'Emergency', 'Ventilator'];
      const totalCount = hospital.totalBeds || 50;
      const icuCount = hospital.icuBeds || 15;

      for (const cat of bedCategories) {
        const existingBed = await Bed.findOne({ hospitalId: hospital._id, category: cat });
        if (!existingBed) {
          const catTotal = cat === 'ICU' ? icuCount : cat === 'Ventilator' ? Math.round(icuCount * 0.5) : cat === 'Emergency' ? Math.round(totalCount * 0.3) : totalCount;
          const catOccupied = Math.round(catTotal * 0.35);
          await Bed.create({
            hospitalId: hospital._id,
            category: cat,
            total: catTotal,
            occupied: catOccupied
          });
        }
      }

      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      for (const group of bloodGroups) {
        const existingBlood = await BloodInventory.findOne({ hospitalId: hospital._id, bloodGroup: group });
        if (!existingBlood) {
          await BloodInventory.create({
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHospital = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByIdAndUpdate(id, req.body, { new: true });
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteHospital = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByIdAndDelete(id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    // Clean up beds and blood inventory
    await Bed.deleteMany({ hospitalId: id });
    await BloodInventory.deleteMany({ hospitalId: id });
    res.json({ message: 'Hospital and associated resources removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
