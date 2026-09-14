import 'dotenv/config';

import {
  getPotentialOptionGradeTextMapByLevel,
  type PotentialGrade,
  type PotentialOptionGradeKind,
} from '@maple/data-potential';
import { disconnectDb } from '@maple/db';
import {
  seedEquipmentPotentialOptionTexts,
  type EquipmentPotentialOptionTextSeedItem,
} from '@maple/db/admin';

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

const potentialKinds = ['potential', 'additional'] as const satisfies readonly PotentialOptionGradeKind[];
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
] as const;

function createSeedItems(): EquipmentPotentialOptionTextSeedItem[] {
  const items: EquipmentPotentialOptionTextSeedItem[] = [];

  for (const kind of potentialKinds) {
    for (const level of generatedLevels) {
      for (const part of potentialParts) {
        const optionGradeMap = getPotentialOptionGradeTextMapByLevel(level, kind, part);

        for (const [optionText, grades] of Object.entries(optionGradeMap)) {
          for (const grade of grades as readonly PotentialGrade[]) {
            items.push({
              kind,
              level,
              part,
              grade,
              optionText,
            });
          }
        }
      }
    }
  }

  return items;
}

async function main(): Promise<void> {
  const result = await seedEquipmentPotentialOptionTexts({
    items: createSeedItems(),
  });

  console.log('Seeded equipment potential option texts:', result);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
