import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEquipmentJson } from '../dist/equipment/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, '..');
const repoRoot = path.resolve(packageDir, '..', '..');
const outputDir = path.join(packageDir, 'src', 'generated', 'equipment');

const generatedEquipment = createEquipmentJson();

await mkdir(outputDir, { recursive: true });

await Promise.all(
  Object.entries(generatedEquipment).map(([kind, items]) =>
    writeFile(path.join(outputDir, `${kind}.json`), `${JSON.stringify(items, null, 2)}\n`, 'utf8'),
  ),
);

console.log(
  Object.entries(generatedEquipment)
    .map(([kind, items]) => `generated ${items.length} ${kind} items -> ${path.relative(repoRoot, path.join(outputDir, `${kind}.json`))}`)
    .join('\n'),
);
