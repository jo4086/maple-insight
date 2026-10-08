import 'dotenv/config';

import path from 'node:path';

import { disconnectDb } from '@maple/db';
import { seedGameDataBundle } from '@maple/db/admin';

import { getGameDataJsonDirectory } from './game-data-path';

const DEFAULT_VERSION = '1.2.424';

function getVersion(): string {
  return process.argv.slice(2).find((arg) => arg !== '--') ?? process.env.GAME_DATA_VERSION ?? DEFAULT_VERSION;
}

function getEquipmentDir(): string {
  return process.env.EQUIPMENT_JSON_DIR ?? path.resolve(process.cwd(), '../../..', 'packages', 'generator', 'src', 'generated', 'equipment');
}

async function main(): Promise<void> {
  const version = getVersion();
  const result = await seedGameDataBundle({
    version,
    gameDataDir: getGameDataJsonDirectory(version),
    equipmentDir: getEquipmentDir(),
  });

  console.log('Seeded game data bundle:', result);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
