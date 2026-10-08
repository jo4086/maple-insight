import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { parseGameDataReleaseDate, resolveGameDataVersion, type GameDataEnvironment } from '@/domain/game-data-version';

export const gameDataVersionStatuses = ['importing', 'ready', 'failed'] as const;
export type GameDataVersionStatus = (typeof gameDataVersionStatuses)[number];

export type StartGameDataVersionImportOptions = {
  releasedOn?: string;
};

export async function ensureGameDataVersion(tx: Prisma.TransactionClient, version: string, options: StartGameDataVersionImportOptions = {}): Promise<void> {
  const metadata = resolveGameDataVersion(version);
  const numbers = {
    major: metadata.major,
    minor: metadata.minor,
    patch: metadata.patch,
  };
  const { environment } = metadata;
  const releasedOn = options.releasedOn ? parseGameDataReleaseDate(options.releasedOn) : undefined;

  await tx.gameDataVersion.upsert({
    where: { version },
    update: {
      ...numbers,
      environment,
      ...(releasedOn ? { releasedOn } : {}),
      status: 'importing',
      completedAt: null,
    },
    create: {
      version,
      ...numbers,
      environment,
      releasedOn,
      status: 'importing',
    },
  });
}

export async function startGameDataVersionImport(version: string, options: StartGameDataVersionImportOptions = {}): Promise<void> {
  await prisma.$transaction((tx) => ensureGameDataVersion(tx, version, options));
}

export type { GameDataEnvironment };

export async function completeGameDataVersionImport(version: string): Promise<void> {
  await prisma.gameDataVersion.update({
    where: { version },
    data: {
      status: 'ready',
      completedAt: new Date(),
    },
  });
}

export async function failGameDataVersionImport(version: string): Promise<void> {
  await prisma.gameDataVersion.update({
    where: { version },
    data: {
      status: 'failed',
      completedAt: null,
    },
  });
}

export async function findGameDataVersions(status?: GameDataVersionStatus) {
  return prisma.gameDataVersion.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
  });
}
