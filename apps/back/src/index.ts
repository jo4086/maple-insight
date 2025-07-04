import 'dotenv/config';
import app, { App } from './app';

const PORT = Number(process.env.PORT) || 8000;

async function server() {
  try {
    await App();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initalize app:', error);
    process.exit(1);
  }
}

server();
