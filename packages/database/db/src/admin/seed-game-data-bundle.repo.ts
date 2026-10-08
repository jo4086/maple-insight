import { completeGameDataVersionImport, failGameDataVersionImport, startGameDataVersionImport } from './game-data-version.repo';
import { seedEquipment, type SeedEquipmentResult } from './seed-equipment.repo';
import { seedGameDataRaw, type SeedGameDataRawResult } from './seed-game-data-raw.repo';
import { seedGameData, type SeedGameDataResult } from './seed-game-data.repo';

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

export async function seedGameDataBundle(options: SeedGameDataBundleOptions): Promise<SeedGameDataBundleResult> {
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
