import { resolve } from 'path';

import alias from 'esbuild-plugin-alias';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'game-skill/index': 'src/game-skill/index.ts',
    'monster/index': 'src/monster/index.ts',
    'taxonomy/index': 'src/taxonomy/index.ts',
    'equipment/index': 'src/equipment/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  outDir: 'dist',
  clean: true,
  skipNodeModulesBundle: true,
  external: ['@maple/data-skill', '@maple/db', '@maple/db/admin'],
  esbuildPlugins: [
    alias({
      '@': resolve(__dirname, 'src'),
      '@maple/data-core': resolve(__dirname, '../game-data/core/dist/index.js'),
      '@maple/data-equipment': resolve(__dirname, '../game-data/equipment/dist/index.js'),
    }),
  ],
});
