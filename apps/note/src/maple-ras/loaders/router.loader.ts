import { Application } from 'express';

import characterRouter from '../interface/character/character.router';
import ingestRouter from '../interface/ingest/ingest.router';

function routerLoader(app: Application) {
  app.use('/api/character', characterRouter);
  app.use('/api/ingest', ingestRouter);
}

export default routerLoader;
