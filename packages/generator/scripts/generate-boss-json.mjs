import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createBossSpecs } from '../dist/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, '..');
const repoRoot = path.resolve(packageDir, '..', '..');
const outputPath = path.join(
  repoRoot,
  'packages',
  'game-data',
  'monster',
  'src',
  'boss',
  'generated',
  'bossSpec.json',
);

const generatedBossSpecs = createBossSpecs();

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    generatedBossSpecs,
    (_, value) => (typeof value === 'bigint' ? value.toString() : value),
    2,
  )}\n`,
  'utf8',
);

console.log(
  `generated ${generatedBossSpecs.length} boss specs -> ${path.relative(repoRoot, outputPath)}`,
);
