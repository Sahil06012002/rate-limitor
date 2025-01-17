import { Router } from 'express';
import authRoutes from './auth';
import appRoutes from './app';
import proxyRoutes from './proxy';

const router = Router();

router.use('/auth', authRoutes);
router.use('/apps', appRoutes);
router.use('/apis', proxyRoutes);

export default router;