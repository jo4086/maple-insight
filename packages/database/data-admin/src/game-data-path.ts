import path from 'node:path';

import { resolveGameDataVersion } from '@maple/db/game-data-version';

function getGameDataVersionDirectory(version: string): string {
  const { environment } = resolveGameDataVersion(version);

  return path.resolve(process.cwd(), '../../..', 'data', environment, version);
}

export function getGameDataJsonDirectory(version: string): string {
  return process.env.GAME_DATA_JSON_DIR ?? path.join(getGameDataVersionDirectory(version), 'json');
}

export function getGameDataGeneratedDirectory(version: string): string {
  return path.join(getGameDataVersionDirectory(version), 'generated');
}
