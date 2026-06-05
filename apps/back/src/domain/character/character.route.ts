import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

// import characterController from './character.controller';
import characterController from './character.controller';
import { validateCharacterLookupQuery } from './character.validators';

const router: ExpressRouter = Router();

router.get('/search', validateCharacterLookupQuery, characterController.lookup);

export default router;
