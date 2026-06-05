import { resolve } from 'path';

import alias from 'esbuild-plugin-alias';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'export-game-skills-by-raw-job': 'src/export-game-skills-by-raw-job.ts',
    index: 'src/index.ts',
    'seed-boss': 'src/seed-boss.ts',
    'seed-equipment': 'src/seed-equipment.ts',
    'seed-game-data': 'src/seed-game-data.ts',
    'seed-game-data-raw': 'src/seed-game-data-raw.ts',
  },
  format: ['cjs'],
  dts: false,
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
