import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    // port: 5173,
    proxy: {
      '/api': {
        target: 'http://172.30.1.85:8001',
        changeOrigin: true,
      },
    },
  },
});
