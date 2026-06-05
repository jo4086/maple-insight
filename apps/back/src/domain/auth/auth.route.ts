import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

import authController from './auth.controller';

const router: ExpressRouter = Router();

router.get('/me', authController.getMe);
router.post('/nexon-api-key', authController.registerNexonApiKey);
router.post('/logout', authController.logout);

export default router;
