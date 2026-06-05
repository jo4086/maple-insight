import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPotentialOptionGradeTextMapByLevel } from '../../game-data/potential/dist/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, '..');
const repoRoot = path.resolve(packageDir, '..', '..');
const outputDir = path.join(packageDir, 'src', 'generated', 'potential');
const generatedLevels = [
  ...Array.from({ length: 121 }, (_, level) => level).filter((level) => [0, 2, 3, 5, 7, 8].includes(level % 10)),
  64,
  79,
  99,
  135,
  145,
  130,
  140,
  150,
  160,
  200,
  250,
].filter((level, index, levels) => levels.indexOf(level) === index).sort((a, b) => a - b);

function createByLevel(kind) {
  return Object.fromEntries(
    generatedLevels.map((level) => [
      String(level),
      getPotentialOptionGradeTextMapByLevel(level, kind),
    ]),
  );
}

function createByLevelGrade(kind) {
  return Object.fromEntries(
    generatedLevels.map((level) => {
      const optionGradeMap = getPotentialOptionGradeTextMapByLevel(level, kind);
      const gradeOptionMap = {
        normal: [],
        rare: [],
        epic: [],
        unique: [],
        legendary: [],
      };

      for (const [optionText, grades] of Object.entries(optionGradeMap)) {
        for (const grade of grades) {
          gradeOptionMap[grade].push(optionText);
        }
      }

      return [String(level), gradeOptionMap];
    }),
  );
}

const outputs = {
  'potential.json': createByLevel('potential'),
  'additional-potential.json': createByLevel('additional'),
  'potential-by-grade.json': createByLevelGrade('potential'),
  'additional-potential-by-grade.json': createByLevelGrade('additional'),
};

await mkdir(outputDir, { recursive: true });
await Promise.all(
  Object.entries(outputs).map(([fileName, json]) =>
    writeFile(path.join(outputDir, fileName), `${JSON.stringify(json, null, 2)}\n`, 'utf8'),
  ),
);

console.log(
  Object.keys(outputs)
    .map((fileName) => `generated potential option grade json -> ${path.relative(repoRoot, path.join(outputDir, fileName))}`)
    .join('\n'),
);
