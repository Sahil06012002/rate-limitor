import { Router } from 'express';
import { registerApp, getApps } from '../controllers/appController';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

router.use(authenticateApiKey);
router.post('/register', registerApp);
router.get('/', getApps);

export default router;