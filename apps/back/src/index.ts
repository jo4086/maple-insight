import 'dotenv/config';

import { disconnectDb } from '@maple/db';

import app, { App } from './app';
import { disconnectRedis } from './lib/redis';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '127.0.0.1';

async function server() {
  try {
    await App();
    const httpServer = app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });

    const shutdown = () => {
      httpServer.close(() => {
        void Promise.allSettled([disconnectRedis(), disconnectDb()]).finally(() => {
          process.exit(0);
        });
      });
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to initalize app:', error);
    process.exit(1);
  }
}

void server();
