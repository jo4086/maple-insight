import { resolve } from 'path';

import alias from 'esbuild-plugin-alias';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'rule/index': 'src/rule/index.ts',
    'value/index': 'src/value/index.ts',
    'fifth/index': 'src/fifth/index.ts',
    'sixth/index': 'src/sixth/index.ts',
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
      '@@types': resolve(__dirname, 'src/internal/types.ts'),
      '@@util': resolve(__dirname, 'src/internal/util.ts'),
    }),
  ],
});
