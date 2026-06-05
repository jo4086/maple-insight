import { resolve } from 'path';

import alias from 'esbuild-plugin-alias';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'union/index': 'src/union/index.ts',
    'raider/index': 'src/union-raider/index.ts',
    'artifact/index': 'src/union-artifact/index.ts',
    'champion/index': 'src/union-champion/index.ts',
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
