import { Application } from 'express';

import { authRouter } from '../domain/auth';
import characterRouter from '../domain/character/character.route';
import { api } from '../middlewares';

function routerLoader(app: Application) {
  app.use(api('auth'), authRouter);
  app.use(api('character'), characterRouter);
}

export default routerLoader;
