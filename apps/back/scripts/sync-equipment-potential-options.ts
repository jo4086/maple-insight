import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { disconnectDb } from '@maple/db';
import { findAllEquipmentPotentialOptionTexts } from '@maple/db/equipment';

type PotentialSnapshot = Record<string, Record<string, Record<string, string[]>>>;

const outputPath = path.resolve(process.cwd(), 'src/domain/character/generated/equipment-potential-options.json');
const temporaryPath = `${outputPath}.tmp`;

function appendOption(snapshot: PotentialSnapshot, level: number, part: string, grade: string, optionText: string) {
  const levelMap = (snapshot[String(level)] ??= {});
  const partMap = (levelMap[part] ??= {});
  const options = (partMap[grade] ??= []);

  options.push(optionText);
}

async function main() {
  const rows = await findAllEquipmentPotentialOptionTexts();
  const snapshot = {
    potential: {} as PotentialSnapshot,
    additional: {} as PotentialSnapshot,
  };

  for (const row of rows) {
    if (row.kind !== 'potential' && row.kind !== 'additional') {
      throw new Error(`Unknown equipment potential kind: ${row.kind}`);
    }

    appendOption(snapshot[row.kind], row.level, row.part, row.grade, row.optionText);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(snapshot)}\n`, 'utf8');
  await rename(temporaryPath, outputPath);

  console.log(`Equipment potential snapshot updated: ${rows.length} rows`);
  console.log(outputPath);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
