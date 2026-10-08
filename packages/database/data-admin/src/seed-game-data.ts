import 'dotenv/config';

import { disconnectDb } from '@maple/db';
import { seedGameData } from '@maple/db/admin';

import { getGameDataJsonDirectory } from './game-data-path';

const DEFAULT_VERSION = '1.2.424';

function getVersion(): string {
  return process.argv.slice(2).find((arg) => arg !== '--') ?? process.env.GAME_DATA_VERSION ?? DEFAULT_VERSION;
}

async function main(): Promise<void> {
  const version = getVersion();
  const dir = getGameDataJsonDirectory(version);
  const result = await seedGameData({
    version,
    dir,
  });

  console.log('Seeded game data:', result);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
