import { Router } from 'express';
import { proxyRequest } from '../controllers/proxyController';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

router.use(authenticateApiKey);
router.all('/:appId/*', proxyRequest);

export default router;