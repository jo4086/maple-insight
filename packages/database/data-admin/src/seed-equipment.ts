import 'dotenv/config';

import path from 'node:path';

import { disconnectDb } from '@maple/db';
import { seedEquipment } from '@maple/db/admin';

function getEquipmentDir(): string {
  return process.env.EQUIPMENT_JSON_DIR ?? path.resolve(process.cwd(), '../../..', 'packages', 'generator', 'src', 'generated', 'equipment');
}

async function main(): Promise<void> {
  const dir = getEquipmentDir();
  const result = await seedEquipment({
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
