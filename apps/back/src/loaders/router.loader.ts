import { Application } from 'express';

import characterRouter from '../domain/character/character.route';

function routerLoader(app: Application) {
  app.use('/character', characterRouter);
}

export default routerLoader;
