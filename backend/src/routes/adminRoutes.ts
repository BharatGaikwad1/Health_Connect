import { Router } from 'express';
import { 
  getAllHospitals, 
  createHospital, 
  updateHospitalStatus, 
  updateHospital, 
  deleteHospital 
} from '../controllers/adminController';

const router = Router();

router.get('/hospitals', getAllHospitals);
router.post('/hospitals', createHospital);
router.put('/hospitals/:id', updateHospital);
router.put('/hospitals/:id/status', updateHospitalStatus);
router.delete('/hospitals/:id', deleteHospital);

export default router;

