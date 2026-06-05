import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGeneratedClasses } from '../dist/class/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, '..');
const repoRoot = path.resolve(packageDir, '..', '..');
const outputDir = path.join(
  repoRoot,
  'packages',
  'game-data',
  'src',
  'json',
);
const outputPath = await getAvailableOutputPath(outputDir, 'classCode', '.json');

const generatedClasses = createGeneratedClasses();

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(generatedClasses, null, 2)}\n`, 'utf8');

console.log(
  `generated ${generatedClasses.length} classes -> ${path.relative(repoRoot, outputPath)}`,
);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getAvailableOutputPath(outputDir, baseName, extension) {
  const defaultPath = path.join(outputDir, `${baseName}${extension}`);

  if (!(await exists(defaultPath))) {
    return defaultPath;
  }

  let version = 1;

  while (true) {
    const versionedPath = path.join(outputDir, `${baseName}-${version}${extension}`);

    if (!(await exists(versionedPath))) {
      return versionedPath;
    }

    version += 1;
  }
}
