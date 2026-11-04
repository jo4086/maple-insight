import { completeGameDataVersionImport, failGameDataVersionImport, startGameDataVersionImport } from './game-data-version.repo';
import { seedEquipment, type SeedEquipmentResult } from './seed-equipment.repo';
import { seedGameDataRaw, type SeedGameDataRawResult } from './seed-game-data-raw.repo';
import { seedGameData, type SeedGameDataResult } from './seed-game-data.repo';

import { prisma } from '@/lib/prisma';

export type SeedGameDataBundleOptions = {
  version: string;
  gameDataDir: string;
  equipmentDir: string;
  chunkSize?: number;
};

export type SeedGameDataBundleResult = {
  version: string;
  raw: SeedGameDataRawResult;
  gameData: SeedGameDataResult;
  equipment: SeedEquipmentResult;
};

export function assertGameDataBundleSeedVersion(version: string, existingStatus: string | null): void {
  if (existingStatus !== null && existingStatus !== 'importing') {
    throw new Error(`Game data bundle seed refuses existing game data version: ${version}`);
  }
}

export async function seedGameDataBundle(options: SeedGameDataBundleOptions): Promise<SeedGameDataBundleResult> {
  const existingVersion = await prisma.gameDataVersion.findUnique({
    where: { version: options.version },
    select: { status: true },
  });
  assertGameDataBundleSeedVersion(options.version, existingVersion?.status ?? null);
  await startGameDataVersionImport(options.version);

  try {
    const raw = await seedGameDataRaw({
      version: options.version,
      dir: options.gameDataDir,
      chunkSize: options.chunkSize,
    });
    const gameData = await seedGameData({
      version: options.version,
      dir: options.gameDataDir,
      chunkSize: options.chunkSize,
    });
    const equipment = await seedEquipment({
      version: options.version,
      dir: options.equipmentDir,
      chunkSize: options.chunkSize,
      importInProgress: true,
    });

    await completeGameDataVersionImport(options.version);

    return {
      version: options.version,
      raw,
      gameData,
      equipment,
    };
  } catch (error) {
    await failGameDataVersionImport(options.version);
    throw error;
  }
}
