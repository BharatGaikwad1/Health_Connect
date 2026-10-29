// @ts-nocheck
import { Request, Response } from 'express';
import BloodInventory from '../models/BloodInventory';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Helper to determine status based on units
const calculateStatus = (units: number): string => {
  if (units <= 2) return 'Critical';
  if (units <= 5) return 'Low Stock';
  if (units >= 25) return 'Surplus';
  return 'Available';
};

// Get blood inventory for a specific hospital
export const getHospitalBlood = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    let records = await BloodInventory.find({ hospitalId });

    // Seed defaults if hospital has no records initialized yet
    if (records.length === 0) {
      const defaultRecords = ALL_BLOOD_GROUPS.map((group) => ({
        hospitalId,
        bloodGroup: group,
        units: 10,
        status: 'Available',
        lastUpdated: new Date()
      }));
      records = await BloodInventory.insertMany(defaultRecords);
    }

    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update specific blood group stock for a hospital
export const updateHospitalBlood = async (req: Request, res: Response) => {
  try {
    const { hospitalId, bloodGroup } = req.params;
    const { units } = req.body;

    const parsedUnits = Math.max(0, Number(units) || 0);
    const computedStatus = calculateStatus(parsedUnits);

    let item = await BloodInventory.findOne({ hospitalId, bloodGroup });
    if (!item) {
      item = await BloodInventory.create({
        hospitalId,
        bloodGroup,
        units: parsedUnits,
        status: computedStatus,
        lastUpdated: new Date()
      });
    } else {
      item.units = parsedUnits;
      item.status = computedStatus;
      item.lastUpdated = new Date();
      await item.save();
    }

    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
