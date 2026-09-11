import type { Application } from 'express';

import expressLoader from './express.loader';
import routerLoader from './router.loader';
import { errorHandler } from '../middlewares';
import { connectRedis } from '../lib/redis';

export async function initLoaders(app: Application) {
  await connectRedis();
  expressLoader(app);

  routerLoader(app);
  app.use(errorHandler);
}
