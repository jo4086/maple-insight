import { resolve } from 'path';

import alias from 'esbuild-plugin-alias';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'admin/index': 'src/admin/index.ts',
    'admin/game-skill-query.repo': 'src/admin/game-skill-query.repo.ts',
    'admin/reset.repo': 'src/admin/reset.repo.ts',
    'admin/seed-boss.repo': 'src/admin/seed-boss.repo.ts',
    'admin/seed-equipment.repo': 'src/admin/seed-equipment.repo.ts',
    'admin/seed-game-data.repo': 'src/admin/seed-game-data.repo.ts',
    'admin/seed-game-data-raw.repo': 'src/admin/seed-game-data-raw.repo.ts',
    'repositories/character-group.repo': 'src/repositories/character-group.repo.ts',
    'repositories/ocid.repo': 'src/repositories/ocid.repo.ts',
    'repositories/ranking-snapshot.repo': 'src/repositories/ranking-snapshot.repo.ts',
    'repositories/search-history.repo': 'src/repositories/search-history.repo.ts',
    'repositories/union-ranking.repo': 'src/repositories/union-ranking.repo.ts',
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
