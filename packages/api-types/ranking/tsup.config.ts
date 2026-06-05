import { resolve } from 'path';

import alias from 'esbuild-plugin-alias';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'guild/index': 'src/guild/index.ts',
    'overall/index': 'src/overall/index.ts',
    'union/index': 'src/union/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  outDir: 'dist',
  clean: true,
  skipNodeModulesBundle: true,
  esbuildPlugins: [
    alias({
      '@': resolve(__dirname, 'src'),
    }),
  ],
});
