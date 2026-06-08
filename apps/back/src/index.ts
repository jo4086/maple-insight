import 'dotenv/config';

import app, { App } from './app';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '127.0.0.1';

function server() {
  try {
    App();
    app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initalize app:', error);
    process.exit(1);
  }
}

server();
