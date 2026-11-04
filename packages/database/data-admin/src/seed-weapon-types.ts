import 'dotenv/config';

import { disconnectDb } from '@maple/db';
import { seedWeaponTypes } from '@maple/db/admin';

import { loadWeaponTypeSeedInput } from './seed-weapon-types-loader';

async function main(): Promise<void> {
  const rows = await loadWeaponTypeSeedInput();
  const result = await seedWeaponTypes(rows);

  console.log('Seeded weapon types:', result);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
