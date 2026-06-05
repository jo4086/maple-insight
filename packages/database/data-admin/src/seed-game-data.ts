import 'dotenv/config';

import path from 'node:path';

import { disconnectDb } from '@maple/db';
import { seedGameData } from '@maple/db/admin';

const DEFAULT_VERSION = '1.2.424';

function getVersion(): string {
  return process.argv.slice(2).find((arg) => arg !== '--') ?? process.env.GAME_DATA_VERSION ?? DEFAULT_VERSION;
}

function getDataDir(version: string): string {
  return process.env.GAME_DATA_JSON_DIR ?? path.resolve(process.cwd(), '../../..', 'data', version, 'json');
}

async function main(): Promise<void> {
  const version = getVersion();
  const dir = getDataDir(version);
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
