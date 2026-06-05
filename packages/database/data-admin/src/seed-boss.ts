import 'dotenv/config';

import { disconnectDb } from '@maple/db';
import { seedBossSpecs } from '@maple/db/admin';

async function main(): Promise<void> {
  const result = await seedBossSpecs();

  console.log('Seeded boss specs:', result);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
