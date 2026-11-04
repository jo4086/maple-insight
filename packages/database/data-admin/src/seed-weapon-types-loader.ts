import { readFile } from 'node:fs/promises';
import path from 'node:path';

const weaponTypesPath = path.resolve(
  process.cwd(),
  '../../game-data/equipment/data/weapon-types.json',
);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function loadWeaponTypeSeedInput(filePath = weaponTypesPath): Promise<unknown> {
  let contents: string;
  try {
    contents = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    throw new Error(`Failed to read weapon type seed JSON at ${filePath}: ${errorMessage(error)}`, {
      cause: error,
    });
  }

  try {
    return JSON.parse(contents) as unknown;
  } catch (error: unknown) {
    throw new Error(`Failed to parse weapon type seed JSON at ${filePath}: ${errorMessage(error)}`, {
      cause: error,
    });
  }
}
