import type { Application } from 'express';

import expressLoader from './express.loader';
import routerLoader from './router.loader';
import { errorHandler } from '../middlewares';

export function initLoaders(app: Application) {
  try {
    expressLoader(app);

    routerLoader(app);
    app.use(errorHandler);
  } catch (error) {
    console.error('loader error:', error);
  }
}
