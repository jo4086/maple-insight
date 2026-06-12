import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createGeneratedTaxonomyAffiliationClassSource,
  createGeneratedTaxonomyClassDetailSource,
} from '../dist/taxonomy/index.js';
import {
  allClassKeyMap,
  classTree,
  generatorClassNames,
  generatorKeys,
} from '../../game-data/core/dist/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, '..');
const repoRoot = path.resolve(packageDir, '..', '..');

const outputPaths = [
  path.join(packageDir, 'src', 'generated', 'taxonomy', 'affiliationClass.ts'),
  path.join(repoRoot, 'packages', 'game-data', 'core', 'src', 'legacy', 'taxonomy', 'affiliationClass.ts'),
];

const source = createGeneratedTaxonomyAffiliationClassSource({ allClassKeyMap, classTree });
const taxonomySource = createGeneratedTaxonomyClassDetailSource({
  allClassKeyMap,
  generatorKeys,
  generatorClassNames,
});

for (const outputPath of outputPaths) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, source, 'utf8');

  console.log(`generated taxonomy affiliation classes -> ${path.relative(repoRoot, outputPath)}`);
}

const taxonomyOutputPath = path.join(
  repoRoot,
  'packages',
  'game-data',
  'core',
  'src',
  'taxonomy',
  'generator',
  'generated.ts',
);

await writeFile(taxonomyOutputPath, taxonomySource, 'utf8');
console.log(`generated taxonomy class details -> ${path.relative(repoRoot, taxonomyOutputPath)}`);
