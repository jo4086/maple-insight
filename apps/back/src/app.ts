import express, { Application } from 'express';
import { initLoaders } from './loaders';

const app: Application = express();

export async function App() {
  await initLoaders(app);
}

export default app;
