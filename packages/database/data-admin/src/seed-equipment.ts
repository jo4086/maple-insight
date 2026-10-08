import 'dotenv/config';

import path from 'node:path';

import { disconnectDb } from '@maple/db';
import { seedEquipment } from '@maple/db/admin';

const DEFAULT_VERSION = '1.2.424';

function getVersion(): string {
  return process.argv.slice(2).find((arg) => arg !== '--') ?? process.env.GAME_DATA_VERSION ?? DEFAULT_VERSION;
}

function getEquipmentDir(): string {
  return process.env.EQUIPMENT_JSON_DIR ?? path.resolve(process.cwd(), '../../..', 'packages', 'generator', 'src', 'generated', 'equipment');
}

async function main(): Promise<void> {
  const version = getVersion();
  const dir = getEquipmentDir();
  const result = await seedEquipment({
    version,
    dir,
  });

  console.log('Seeded equipment:', result);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
