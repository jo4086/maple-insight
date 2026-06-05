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
]
  .filter((level, index, levels) => levels.indexOf(level) === index)
  .sort((a, b) => a - b);

const potentialGrades = ['normal', 'rare', 'epic', 'unique', 'legendary'];

const potentialParts = [
  '무기',
  '보조무기',
  '엠블렘',
  '모자',
  '상의',
  '하의',
  '한벌옷',
  '망토',
  '신발',
  '장갑',
  '어깨장식',
  '벨트',
  '반지',
  '펜던트',
  '눈장식',
  '얼굴장식',
  '귀고리',
  '기계심장',
];

function createByLevelPartGrade(kind) {
  return Object.fromEntries(
    generatedLevels.map((level) => [
      String(level),
      Object.fromEntries(
        potentialParts.map((part) => [
          part,
          Object.fromEntries(potentialGrades.map((grade) => [grade, createOptionsByGrade(level, kind, part, grade)])),
        ]),
      ),
    ]),
  );
}

function createOptionsByGrade(level, kind, part, targetGrade) {
  const optionGradeMap = getPotentialOptionGradeTextMapByLevel(level, kind, part);

  return Object.entries(optionGradeMap)
    .filter(([, grades]) => grades.includes(targetGrade))
    .map(([optionText]) => optionText);
}

const outputs = {
  'potential-by-part-grade.json': createByLevelPartGrade('potential'),
  'additional-potential-by-part-grade.json': createByLevelPartGrade('additional'),
};

await mkdir(outputDir, { recursive: true });
await Promise.all(
  Object.entries(outputs).map(([fileName, json]) => writeFile(path.join(outputDir, fileName), `${JSON.stringify(json, null, 2)}\n`, 'utf8')),
);

console.log(
  Object.keys(outputs)
    .map((fileName) => `generated potential option grade part json -> ${path.relative(repoRoot, path.join(outputDir, fileName))}`)
    .join('\n'),
);
