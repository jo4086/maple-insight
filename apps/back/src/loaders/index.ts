import type { Application } from 'express';

import expressLoader from './express.loader';
import routerLoader from './router.loader';

export function initLoaders(app: Application) {
  try {
    expressLoader(app);

    routerLoader(app);
  } catch (error) {
    console.error('loader error:', error);
  }
}
