import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export type SearchSnapshot = {
  worldName?: string | null;
  guildName?: string | null;
  characterName?: string | null;
  className?: string | null;
  level?: number | null;
  unionRankingData?: unknown;
};

export type RecordCharacterSearchInput = {
  ocidRowId: bigint;
  searchDate: Date;
  snapshot: SearchSnapshot;
};

function normalizeSearchDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function findSearchHistoryByDate(ocidRowId: bigint, searchDate: Date) {
  return prisma.searchHistory.findUnique({
    where: {
      ocidRowId_searchDate: {
        ocidRowId,
        searchDate: normalizeSearchDate(searchDate),
      },
    },
  });
}

export async function recordCharacterSearch(input: RecordCharacterSearchInput) {
  const searchDate = normalizeSearchDate(input.searchDate);
  const current = await findSearchHistoryByDate(input.ocidRowId, searchDate);

  const nextSnapshots = Array.isArray(current?.searchSnapshots)
    ? [...current.searchSnapshots, input.snapshot]
    : [input.snapshot];
  const serializedSnapshots = nextSnapshots as Prisma.InputJsonValue;

  return prisma.searchHistory.upsert({
    where: {
      ocidRowId_searchDate: {
        ocidRowId: input.ocidRowId,
        searchDate,
      },
    },
    create: {
      ocidRowId: input.ocidRowId,
      searchDate,
      searchCount: 1,
      searchSnapshots: serializedSnapshots,
    },
    update: {
      searchCount: {
        increment: 1,
      },
      searchSnapshots: serializedSnapshots,
    },
  });
}

export async function listSearchHistoriesByDate(searchDate: Date) {
  return prisma.searchHistory.findMany({
    where: {
      searchDate: normalizeSearchDate(searchDate),
    },
    orderBy: [
      { updatedAt: 'desc' },
      { id: 'desc' },
    ],
  });
}
