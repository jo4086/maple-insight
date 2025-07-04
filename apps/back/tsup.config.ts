import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  sourcemap: true,
  outDir: 'dist',
  clean: true,
  skipNodeModulesBundle: true,
});
