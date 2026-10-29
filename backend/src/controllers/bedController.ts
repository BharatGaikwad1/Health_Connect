// @ts-nocheck
import { Request, Response } from 'express';
import Bed from '../models/Bed';
import DischargeHistory from '../models/DischargeHistory';

const BED_CATEGORIES = ['ICU', 'General', 'Emergency', 'Ventilator'];

// Get beds for a specific hospital
export const getHospitalBeds = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    let beds = await Bed.find({ hospitalId });

    // Seed defaults if hospital has no bed records initialized yet
    if (beds.length === 0) {
      const defaultRecords = BED_CATEGORIES.map((cat) => ({
        hospitalId,
        category: cat,
        total: cat === 'ICU' ? 20 : cat === 'Ventilator' ? 10 : cat === 'Emergency' ? 25 : 50,
        occupied: cat === 'ICU' ? 12 : cat === 'Ventilator' ? 4 : cat === 'Emergency' ? 15 : 24
      }));
      beds = await Bed.insertMany(defaultRecords);
    }

    res.json(beds);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update bed status & automatically log discharge history when occupied beds decrease
export const updateBed = async (req: Request, res: Response) => {
  try {
    const { hospitalId, category } = req.params;
    const { total, occupied, patientName, reason } = req.body;
    
    let bed: any = await Bed.findOne({ hospitalId, category });
    if (!bed) {
      bed = await Bed.create({ hospitalId, category, total: total || 20, occupied: occupied || 10 });
    } else {
      const oldOccupied = bed.occupied;
      const newOccupied = occupied !== undefined ? occupied : bed.occupied;
      
      // If occupied count decreased, beds were freed by discharging patients
      if (occupied !== undefined && newOccupied < oldOccupied) {
        const bedsFreed = oldOccupied - newOccupied;
        await DischargeHistory.create({
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
      await bed.save();
    }
    
    res.json(bed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Record an explicit patient discharge
export const recordPatientDischarge = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const { category, patientName, reason, bedsFreed } = req.body;

    const count = bedsFreed ? parseInt(bedsFreed, 10) : 1;
    let bed = await Bed.findOne({ hospitalId, category });

    if (!bed) {
      bed = await Bed.create({ hospitalId, category, total: 20, occupied: 10 });
    }

    const previousOccupied = bed.occupied;
    const newOccupied = Math.max(0, bed.occupied - count);
    bed.occupied = newOccupied;
    await bed.save();

    const discharge = await DischargeHistory.create({
      hospitalId,
      category,
      patientName: patientName?.trim() || `Patient #${Math.floor(100 + Math.random() * 900)}`,
      patientId: `HC-${category.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      reason: reason?.trim() || 'Medical Stabilization & Recovery Complete',
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch discharge history for hospital
export const getDischargeHistory = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    let history = await DischargeHistory.find({ hospitalId }).sort({ createdAt: -1 }).limit(30);

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
      history = await DischargeHistory.insertMany(initialSeed);
    }

    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
