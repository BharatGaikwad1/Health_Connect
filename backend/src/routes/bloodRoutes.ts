import { Router } from 'express';
import { getHospitalBlood, updateHospitalBlood } from '../controllers/bloodController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/:hospitalId', authenticate, getHospitalBlood);
router.put('/:hospitalId/:bloodGroup', authenticate, updateHospitalBlood);

export default router;
