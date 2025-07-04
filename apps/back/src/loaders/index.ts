import type { Application } from 'express';

import expressLoader from './express.loader';

export async function initLoaders(app: Application) {
  try {
    expressLoader(app);
  } catch (error) {
    console.error('loader error:', error);
  }
}
