import { Router } from 'express';
import { 
  login, 
  register, 
  registerHospital,
  uploadHospitalDocument,
  sendHospitalOtp,
  verifyHospitalOtp,
  getProfile, 
  updateProfile 
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/register-hospital', registerHospital);
router.post('/upload-document', uploadHospitalDocument);
router.post('/send-otp', sendHospitalOtp);
router.post('/verify-otp', verifyHospitalOtp);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
