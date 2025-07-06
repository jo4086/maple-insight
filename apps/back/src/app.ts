import express, { Application } from 'express';

import { initLoaders } from './loaders';

const app: Application = express();

export function App() {
  initLoaders(app);
}

export default app;
