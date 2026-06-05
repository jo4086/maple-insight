import { prisma } from '@/lib/prisma';
import type { UnionRankingItem } from '@/types/api';

const REPRESENTATIVE_RECENCY_WINDOW_MS = 24 * 60 * 60 * 1000;
const NUMERIC_SIMILARITY_THRESHOLD = 0.98;

export type SaveCharacterUnionRankingInput = {
  ocidRowId: bigint;
  queriedCharacterName: string;
  rankingDate: string;
  payload: unknown;
  rankingItem?: UnionRankingItem;
};

function buildUnionRankingAccountKey(rankingItem?: UnionRankingItem) {
  if (!rankingItem) {
    return null;
  }

  return [rankingItem.world_name, rankingItem.union_level, rankingItem.union_power].join(':');
}

function calculateNumericSimilarity(left: number | null | undefined, right: number | null | undefined) {
  if (left == null || right == null) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const max = Math.max(Math.abs(left), Math.abs(right));
  if (max === 0) {
    return 1;
  }

  return Math.min(Math.abs(left), Math.abs(right)) / max;
}

function isRecentRepresentativeCandidate(fetchedAt: Date) {
  return Date.now() - fetchedAt.getTime() <= REPRESENTATIVE_RECENCY_WINDOW_MS;
}

function hasStrongUnionRankingSimilarity(
  rankingItem: UnionRankingItem,
  candidate: {
    ranking: number | null;
    unionLevel: number | null;
    unionPower: number | null;
  },
) {
  const rankingSimilarity = calculateNumericSimilarity(rankingItem.ranking, candidate.ranking);
  const unionLevelSimilarity = calculateNumericSimilarity(rankingItem.union_level, candidate.unionLevel);
  const unionPowerSimilarity = calculateNumericSimilarity(rankingItem.union_power, candidate.unionPower);

  return (
    rankingSimilarity >= NUMERIC_SIMILARITY_THRESHOLD &&
    unionLevelSimilarity >= NUMERIC_SIMILARITY_THRESHOLD &&
    unionPowerSimilarity >= NUMERIC_SIMILARITY_THRESHOLD
  );
}

async function resolveRepresentativeOcidRowId(
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>,
  input: SaveCharacterUnionRankingInput,
) {
  const rankingItem = input.rankingItem;

  if (!rankingItem) {
    return null;
  }

  if (rankingItem.character_name === input.queriedCharacterName) {
    return input.ocidRowId;
  }

  const candidates = await tx.unionRanking.findMany({
    where: {
      queriedCharacterName: rankingItem.character_name,
      worldName: rankingItem.world_name,
      className: rankingItem.class_name,
    },
    select: {
      ocidRowId: true,
      ranking: true,
      unionLevel: true,
      unionPower: true,
      fetchedAt: true,
    },
    orderBy: {
      fetchedAt: 'desc',
    },
    take: 5,
  });

  const recentExactCandidate = candidates.find((candidate) => isRecentRepresentativeCandidate(candidate.fetchedAt));
  if (recentExactCandidate) {
    return recentExactCandidate.ocidRowId;
  }

  const similarCandidate = candidates.find((candidate) => hasStrongUnionRankingSimilarity(rankingItem, candidate));
  return similarCandidate?.ocidRowId ?? null;
}

export async function findUnionRankingByOcidRowId(ocidRowId: bigint) {
  return prisma.unionRanking.findUnique({
    where: { ocidRowId },
  });
}

export async function findUnionRankingsByAccountKey(accountKey: string) {
  return prisma.unionRanking.findMany({
    where: { accountKey },
    orderBy: [
      { isPrimaryCharacter: 'desc' },
      { queriedCharacterName: 'asc' },
    ],
  });
}

export async function saveCharacterUnionRanking(input: SaveCharacterUnionRankingInput) {
  const accountKey = buildUnionRankingAccountKey(input.rankingItem);
  const primaryCharacterName = input.rankingItem?.character_name ?? null;
  const isPrimaryCharacter = primaryCharacterName
    ? primaryCharacterName === input.queriedCharacterName
    : null;

  return prisma.$transaction(async (tx) => {
    const representativeOcidRowId = await resolveRepresentativeOcidRowId(tx, input);

    return tx.unionRanking.upsert({
      where: { ocidRowId: input.ocidRowId },
      create: {
        ocidRowId: input.ocidRowId,
        rankingDate: input.rankingDate,
        queriedCharacterName: input.queriedCharacterName,
        primaryCharacterName,
        isPrimaryCharacter,
        accountKey,
        representativeOcidRowId,
        ranking: input.rankingItem?.ranking ?? null,
        worldName: input.rankingItem?.world_name ?? null,
        className: input.rankingItem?.class_name ?? null,
        subClassName: input.rankingItem?.sub_class_name ?? null,
        unionLevel: input.rankingItem?.union_level ?? null,
        unionPower: input.rankingItem?.union_power ?? null,
        rawPayload: input.payload as object,
      },
      update: {
        rankingDate: input.rankingDate,
        queriedCharacterName: input.queriedCharacterName,
        primaryCharacterName,
        isPrimaryCharacter,
        accountKey,
        representativeOcidRowId,
        ranking: input.rankingItem?.ranking ?? null,
        worldName: input.rankingItem?.world_name ?? null,
        className: input.rankingItem?.class_name ?? null,
        subClassName: input.rankingItem?.sub_class_name ?? null,
        unionLevel: input.rankingItem?.union_level ?? null,
        unionPower: input.rankingItem?.union_power ?? null,
        rawPayload: input.payload as object,
        fetchedAt: new Date(),
      },
    });
  });
}
