import { Router } from 'express';
import { getHospitals, getHospitalById, updateHospitalProfile } from '../controllers/hospitalController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getHospitals);
router.get('/:id', getHospitalById);
router.put('/:id', authenticate, updateHospitalProfile);

export default router;
