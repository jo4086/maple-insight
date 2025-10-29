import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

import characterController from './character.controller';
const router: ExpressRouter = Router();

router.get('/search', characterController.lookup);

export default router;
