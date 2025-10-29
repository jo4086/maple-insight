import { Application } from 'express';

import characterRouter from '../domain/character/character.route';
import { api } from '../middlewares';

function routerLoader(app: Application) {
  app.use(api('character'), characterRouter);
}

export default routerLoader;
