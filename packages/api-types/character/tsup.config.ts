import { resolve } from 'path';

import alias from 'esbuild-plugin-alias';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    ability: 'src/ability/index.ts',
    'android-equipment': 'src/android-equipment/index.ts',
    basic: 'src/basic/index.ts',
    'beauty-equipment': 'src/beauty-equipment/index.ts',
    'cashitem-equipment': 'src/cashitem-equipment/index.ts',
    dojang: 'src/dojang/index.ts',
    hexamatrix: 'src/hexamatrix/index.ts',
    'hexamatrix-stat': 'src/hexamatrix-stat/index.ts',
    'hyper-stat': 'src/hyper-stat/index.ts',
    'item-equipment': 'src/item-equipment/index.ts',
    'link-skill': 'src/link-skill/index.ts',
    'other-stat': 'src/other-stat/index.ts',
    'pet-equipment': 'src/pet-equipment/index.ts',
    popularity: 'src/popularity/index.ts',
    propensity: 'src/propensity/index.ts',
    'ring-reserve-skill-equipment': 'src/ring-reserve-skill-equipment/index.ts',
    'set-effect': 'src/set-effect/index.ts',
    skill: 'src/skill/index.ts',
    stat: 'src/stat/index.ts',
    'symbol-equipment': 'src/symbol-equipment/index.ts',
    vmatrix: 'src/vmatrix/index.ts',
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
