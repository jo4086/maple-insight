export const gameDataEnvironments = ['test', 'production'] as const;
export type GameDataEnvironment = (typeof gameDataEnvironments)[number];

export type GameDataVersionNumber = {
  major: number;
  minor: number;
  patch: number;
};

export type GameDataVersionMetadata = GameDataVersionNumber & {
  version: string;
  environment: GameDataEnvironment;
};

export function parseGameDataVersion(version: string): GameDataVersionNumber {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);

  if (!match) {
    throw new Error(`Invalid game data version: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function resolveGameDataEnvironment(patch: number): GameDataEnvironment {
  if (patch >= 100 && patch <= 299) return 'test';
  if (patch >= 300 && patch <= 499) return 'production';

  throw new Error(`Unsupported game data patch version: ${patch}`);
}

export function resolveGameDataVersion(version: string): GameDataVersionMetadata {
  const numbers = parseGameDataVersion(version);

  return {
    version,
    ...numbers,
    environment: resolveGameDataEnvironment(numbers.patch),
  };
}

export function parseGameDataReleaseDate(releasedOn: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(releasedOn)) {
    throw new Error(`Invalid game data release date: ${releasedOn}`);
  }

  const date = new Date(`${releasedOn}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== releasedOn) {
    throw new Error(`Invalid game data release date: ${releasedOn}`);
  }

  return date;
}
