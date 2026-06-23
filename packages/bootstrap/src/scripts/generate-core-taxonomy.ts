import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { allClassKeyMap } from '../../../game-data/core/src/taxonomy/class-group-map';
import { generatorClassNames, generatorKeys } from '../../../game-data/core/src/taxonomy/generator/input';
import { createGeneratedTaxonomyClassDetailSource } from '../taxonomy';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, '..', '..');
const repoRoot = path.resolve(packageDir, '..', '..');
const outputPath = path.join(repoRoot, 'packages', 'game-data', 'core', 'src', 'taxonomy', 'generator', 'generated.ts');

const source = createGeneratedTaxonomyClassDetailSource({
  allClassKeyMap,
  generatorKeys,
  generatorClassNames,
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, source, 'utf8');

console.log(`generated core taxonomy -> ${path.relative(repoRoot, outputPath)}`);
