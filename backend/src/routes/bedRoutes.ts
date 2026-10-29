import { Router } from 'express';
import { 
  getHospitalBeds, 
  updateBed, 
  recordPatientDischarge, 
  getDischargeHistory 
} from '../controllers/bedController';

const router = Router();

router.get('/:hospitalId', getHospitalBeds);
router.put('/:hospitalId/:category', updateBed);
router.get('/:hospitalId/discharges', getDischargeHistory);
router.post('/:hospitalId/discharge', recordPatientDischarge);

export default router;
