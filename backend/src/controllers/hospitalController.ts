// @ts-nocheck
import { Request, Response } from 'express';
import Hospital from '../models/Hospital';
import Bed from '../models/Bed';

const BED_CATEGORIES = ['ICU', 'General', 'Emergency', 'Ventilator'];

export const getHospitals = async (req: Request, res: Response) => {
  try {
    const rawHospitals = await Hospital.find({ status: 'approved' }).lean();

    const hospitalsWithBeds = await Promise.all(
      rawHospitals.map(async (hospital, idx) => {
        let beds = await Bed.find({ hospitalId: hospital._id }).lean();

        // If hospital has no beds yet, initialize standard distribution
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

export const getHospitalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id).lean();
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    let beds = await Bed.find({ hospitalId: id }).lean();
    if (!beds || beds.length === 0) {
      const defaultBeds = [
        { hospitalId: id, category: 'ICU', total: 20, occupied: 12 },
        { hospitalId: id, category: 'General', total: 50, occupied: 26 },
        { hospitalId: id, category: 'Emergency', total: 25, occupied: 14 },
        { hospitalId: id, category: 'Ventilator', total: 10, occupied: 4 }
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

    res.json({
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
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHospitalProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { contactNumber, emergencyContact, address, name, city, website, category } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      id,
      { 
        ...(contactNumber !== undefined && { contactNumber }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(address !== undefined && { address }),
        ...(name !== undefined && { name }),
        ...(city !== undefined && { city }),
        ...(website !== undefined && { website }),
        ...(category !== undefined && { category }),
      },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
