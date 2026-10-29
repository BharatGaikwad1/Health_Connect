import { Router } from 'express';
import { getDirections } from '../controllers/navigationController';

const router = Router();

// Public emergency routing: patient navigation requests should not be blocked by token expiry
router.get('/directions', getDirections);

export default router;
