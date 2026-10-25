import { parseGameDataReleaseDate, parseGameDataVersion, resolveGameDataVersion, type GameDataEnvironment } from '@/domain/game-data-version';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export const gameDataVersionStatuses = ['importing', 'ready', 'failed'] as const;
const cloneBatchSize = 100;
export type GameDataVersionStatus = (typeof gameDataVersionStatuses)[number] | 'copying' | 'deleted';

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

  const updated = await tx.gameDataVersion.updateMany({
    where: { version, environment: { not: 'copy' }, status: { not: 'deleted' } },
    data: {
      ...numbers,
      environment,
      ...(releasedOn ? { releasedOn } : {}),
      status: 'importing',
      completedAt: null,
    },
  });
  if (updated.count) return;
  if (await tx.gameDataVersion.findUnique({ where: { version } })) {
    throw new Error(`Game data version cannot start import: ${version}`);
  }
  await tx.gameDataVersion.create({
    data: { version, ...numbers, environment, releasedOn, status: 'importing' },
  });
}

export async function startGameDataVersionImport(version: string, options: StartGameDataVersionImportOptions = {}): Promise<void> {
  await prisma.$transaction((tx) => ensureGameDataVersion(tx, version, options));
}

export type { GameDataEnvironment };

export async function completeGameDataVersionImport(version: string): Promise<void> {
  const result = await prisma.gameDataVersion.updateMany({
    where: { version, environment: { not: 'copy' }, status: 'importing' },
    data: {
      status: 'ready',
      completedAt: new Date(),
    },
  });
  if (result.count !== 1) throw new Error(`Game data version cannot complete import: ${version}`);
}

export async function failGameDataVersionImport(version: string): Promise<void> {
  const result = await prisma.gameDataVersion.updateMany({
    where: { version, status: { in: ['importing', 'copying'] } },
    data: { status: 'failed', completedAt: null },
  });
  if (result.count !== 1) throw new Error(`Game data version cannot fail import: ${version}`);
}

export async function findGameDataVersions(status?: GameDataVersionStatus) {
  return prisma.gameDataVersion.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
  });
}

export async function updateGameDataVersionReleasedOn(version: string, releasedOn: string | null): Promise<void> {
  parseGameDataVersion(version);
  const date = releasedOn === null ? null : parseGameDataReleaseDate(releasedOn);
  const result = await prisma.gameDataVersion.updateMany({
    where: { version, status: { not: 'deleted' } },
    data: { releasedOn: date },
  });
  if (result.count !== 1) throw new Error(`Game data version not found or deleted: ${version}`);
}

export async function finalizeGameDataVersionCopy(version: string): Promise<void> {
  parseGameDataVersion(version);
  const result = await prisma.gameDataVersion.updateMany({
    where: { version, environment: 'copy', status: 'copying' },
    data: { status: 'importing' },
  });
  if (result.count !== 1) throw new Error(`Game data version cannot finalize copy: ${version}`);
}

export async function resetIncompleteGameDataVersionCopy(targetVersion: string): Promise<void> {
  const numbers = parseGameDataVersion(targetVersion);
  if (Object.values(numbers).some((number) => !Number.isSafeInteger(number)) ||
      targetVersion !== `${numbers.major}.${numbers.minor}.${numbers.patch}`) {
    throw new Error(`Invalid target game data version: ${targetVersion}`);
  }

  await prisma.$transaction(async (tx) => {
    const result = await tx.gameDataVersion.deleteMany({
      where: { version: targetVersion, environment: 'copy', status: 'copying' },
    });
    if (result.count !== 1) throw new Error(`Game data version cannot reset incomplete copy: ${targetVersion}`);
  });
}

export async function softDeleteGameDataVersion(version: string): Promise<void> {
  parseGameDataVersion(version);
  const result = await prisma.gameDataVersion.updateMany({
    where: { version, status: { in: [...gameDataVersionStatuses, 'copying'] } },
    data: { status: 'deleted' },
  });
  if (result.count !== 1) throw new Error(`Game data version not found or already deleted: ${version}`);
}

async function copyBatches<T>(fetch: (cursor: T | undefined) => Promise<T[]>, write: (rows: T[]) => Promise<unknown>): Promise<void> {
  let cursor: T | undefined;
  for (;;) {
    const rows = await fetch(cursor);
    if (!rows.length) return;
    await write(rows);
    cursor = rows[rows.length - 1];
  }
}

export async function cloneGameDataVersionInTransaction(tx: Prisma.TransactionClient, sourceVersion: string, targetVersion: string): Promise<void> {
  parseGameDataVersion(sourceVersion);
  const numbers = parseGameDataVersion(targetVersion);
  if (Object.values(numbers).some((number) => !Number.isSafeInteger(number)) ||
      targetVersion !== `${numbers.major}.${numbers.minor}.${numbers.patch}` ||
      sourceVersion === targetVersion) {
    throw new Error(`Invalid target game data version: ${targetVersion}`);
  }

  const source = await tx.gameDataVersion.findUnique({ where: { version: sourceVersion } });
  if (!source || source.status !== 'ready') throw new Error(`Game data version not ready: ${sourceVersion}`);
  if (await tx.gameDataVersion.findUnique({ where: { version: targetVersion } })) {
    throw new Error(`Game data version already exists: ${targetVersion}`);
  }

  await tx.gameDataVersion.create({
    data: { version: targetVersion, ...numbers, environment: 'copy', status: 'copying', releasedOn: source.releasedOn },
  });

  await copyBatches(
    (cursor: { id: bigint } | undefined) => tx.gameDataRawFile.findMany({
      where: { version: sourceVersion }, orderBy: { id: 'asc' }, take: cloneBatchSize,
      ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
    }),
    async (files) => {
      for (const { id, version: _version, createdAt, updatedAt, ...file } of files) {
        const cloned = await tx.gameDataRawFile.create({ data: { ...file, version: targetVersion, createdAt, updatedAt } });
        await copyBatches(
          (cursor: { id: bigint } | undefined) => tx.gameDataRawRecord.findMany({
            where: { fileId: id }, orderBy: { id: 'asc' }, take: cloneBatchSize,
            ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
          }),
          (records) => tx.gameDataRawRecord.createMany({
            data: records.map(({ id: _id, fileId: _fileId, payload, ...record }) => ({
              ...record, fileId: cloned.id, payload: payload === null ? Prisma.JsonNull : payload as Prisma.InputJsonValue,
            })),
          }),
        );
      }
    },
  );
  await copyBatches(
    (cursor: { jobId: string } | undefined) => tx.gameJob.findMany({
      where: { version: sourceVersion }, orderBy: [{ jobId: 'asc' }], take: cloneBatchSize,
      ...(cursor ? { cursor: { version_jobId: { version: sourceVersion, jobId: cursor.jobId } }, skip: 1 } : {}),
    }),
    (rows) => tx.gameJob.createMany({ data: rows.map((job) => ({ ...job, version: targetVersion })) }),
  );
  await copyBatches(
    (cursor: { skillId: string } | undefined) => tx.gameSkill.findMany({
      where: { version: sourceVersion }, orderBy: [{ skillId: 'asc' }], take: cloneBatchSize,
      ...(cursor ? { cursor: { version_skillId: { version: sourceVersion, skillId: cursor.skillId } }, skip: 1 } : {}),
    }),
    (rows) => tx.gameSkill.createMany({ data: rows.map((skill) => ({ ...skill, version: targetVersion })) }),
  );
  await copyBatches(
    (cursor: { skillId: string, commonName: string } | undefined) => tx.gameSkillCommon.findMany({
      where: { version: sourceVersion }, orderBy: [{ skillId: 'asc' }, { commonName: 'asc' }], take: cloneBatchSize,
      ...(cursor ? { cursor: { version_skillId_commonName: { version: sourceVersion, skillId: cursor.skillId, commonName: cursor.commonName } }, skip: 1 } : {}),
    }),
    (rows) => tx.gameSkillCommon.createMany({ data: rows.map((common) => ({ ...common, version: targetVersion })) }),
  );
  await copyBatches(
    (cursor: { skillId: string } | undefined) => tx.gameSkillHint.findMany({
      where: { version: sourceVersion }, orderBy: [{ skillId: 'asc' }], take: cloneBatchSize,
      ...(cursor ? { cursor: { version_skillId: { version: sourceVersion, skillId: cursor.skillId } }, skip: 1 } : {}),
    }),
    (rows) => tx.gameSkillHint.createMany({ data: rows.map((hint) => ({ ...hint, version: targetVersion })) }),
  );
  await copyBatches(
    (cursor: { skillId: string, level: number } | undefined) => tx.gameSkillLevel.findMany({
      where: { version: sourceVersion }, orderBy: [{ skillId: 'asc' }, { level: 'asc' }], take: cloneBatchSize,
      ...(cursor ? { cursor: { version_skillId_level: { version: sourceVersion, skillId: cursor.skillId, level: cursor.level } }, skip: 1 } : {}),
    }),
    (rows) => tx.gameSkillLevel.createMany({ data: rows.map((level) => ({ ...level, version: targetVersion })) }),
  );
  await copyBatches(
    (cursor: { skillId: string, commonName: string } | undefined) => tx.gameSkillPvpCommon.findMany({
      where: { version: sourceVersion }, orderBy: [{ skillId: 'asc' }, { commonName: 'asc' }], take: cloneBatchSize,
      ...(cursor ? { cursor: { version_skillId_commonName: { version: sourceVersion, skillId: cursor.skillId, commonName: cursor.commonName } }, skip: 1 } : {}),
    }),
    (rows) => tx.gameSkillPvpCommon.createMany({ data: rows.map((common) => ({ ...common, version: targetVersion })) }),
  );
  await copyBatches(
    (cursor: { id: bigint } | undefined) => tx.equipmentItem.findMany({
      where: { version: sourceVersion }, orderBy: [{ id: 'asc' }], take: cloneBatchSize,
      ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
    }),
    (rows) => tx.equipmentItem.createMany({ data: rows.map(({ id: _id, requiredClass, ...item }) => ({
        ...item, version: targetVersion,
        requiredClass: requiredClass === null ? Prisma.JsonNull : requiredClass as Prisma.InputJsonValue,
      })) }),
  );

}

export async function cloneGameDataVersion(sourceVersion: string, targetVersion: string): Promise<void> {
  await prisma.$transaction((tx) => cloneGameDataVersionInTransaction(tx, sourceVersion, targetVersion), { timeout: 30 * 60_000 });
}
