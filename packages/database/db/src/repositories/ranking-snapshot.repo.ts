import { prisma } from '@/lib/prisma';

export type CreateRankingRunInput = {
  rankingDate: string;
  pageStart: number;
  pageEnd: number;
};

export async function createRankingRun(input: CreateRankingRunInput) {
  return prisma.rankingRun.create({
    data: {
      rankingDate: input.rankingDate,
      pageStart: input.pageStart,
      pageEnd: input.pageEnd,
      status: 'running',
    },
  });
}

export async function incrementRankingRunNameCount(runId: bigint, count: number) {
  if (count <= 0) {
    return { count: 0 };
  }

  await prisma.rankingRun.update({
    where: { id: runId },
    data: {
      totalNames: {
        increment: count,
      },
    },
  });

  return { count };
}

export async function saveRankingRawPage(runId: bigint, rankingDate: string, page: number, rawPayload: unknown) {
  return prisma.rankingRawPage.upsert({
    where: {
      runId_page: {
        runId,
        page,
      },
    },
    create: {
      runId,
      rankingDate,
      page,
      rawPayload: rawPayload as object,
    },
    update: {
      rankingDate,
      rawPayload: rawPayload as object,
    },
  });
}

export async function findLatestCompletedRankingRun() {
  return prisma.rankingRun.findFirst({
    where: {
      status: 'completed',
    },
    orderBy: {
      id: 'desc',
    },
  });
}

export async function findNextCompletedRankingRunForOcidIngestion() {
  return prisma.rankingRun.findFirst({
    where: {
      status: 'completed',
      OR: [
        {
          ocidCursor: null,
        },
        {
          ocidCursor: {
            status: {
              not: 'completed',
            },
          },
        },
      ],
    },
    orderBy: [
      {
        rankingDate: 'asc',
      },
      {
        pageStart: 'asc',
      },
      {
        id: 'asc',
      },
    ],
  });
}

export async function findLatestCompletedRankingRunByDate(rankingDate: string) {
  return prisma.rankingRun.findFirst({
    where: {
      status: 'completed',
      rankingDate,
    },
    orderBy: {
      id: 'desc',
    },
  });
}

export async function findRankingRawPagesForRun(runId: bigint, pageFrom: number, pageTo: number) {
  return prisma.rankingRawPage.findMany({
    where: {
      runId,
      page: {
        gte: pageFrom,
        lte: pageTo,
      },
    },
    orderBy: {
      page: 'asc',
    },
  });
}

export async function getOrCreateRankingOcidCursor(runId: bigint) {
  return prisma.rankingOcidCursor.upsert({
    where: { runId },
    create: {
      runId,
      status: 'pending',
    },
    update: {},
  });
}

export async function markRankingOcidCursorRunning(runId: bigint) {
  return prisma.rankingOcidCursor.upsert({
    where: { runId },
    create: {
      runId,
      status: 'running',
    },
    update: {
      status: 'running',
      lastError: null,
      finishedAt: null,
    },
  });
}

export type AdvanceRankingOcidCursorInput = {
  runId: bigint;
  lastProcessedPage: number;
  pageOffset: number;
  pageCompleted: boolean;
  processedNameCount: number;
};

export async function advanceRankingOcidCursor(input: AdvanceRankingOcidCursorInput) {
  return prisma.rankingOcidCursor.update({
    where: { runId: input.runId },
    data: {
      lastProcessedPage: input.lastProcessedPage,
      pageOffset: input.pageOffset,
      processedPages: {
        increment: input.pageCompleted ? 1 : 0,
      },
      processedNames: {
        increment: input.processedNameCount,
      },
      status: 'running',
      lastError: null,
    },
  });
}

export async function completeRankingOcidCursor(runId: bigint) {
  return prisma.rankingOcidCursor.update({
    where: { runId },
    data: {
      status: 'completed',
      finishedAt: new Date(),
      lastError: null,
    },
  });
}

export async function failRankingOcidCursor(runId: bigint, lastError: string) {
  return prisma.rankingOcidCursor.update({
    where: { runId },
    data: {
      status: 'failed',
      lastError,
      finishedAt: new Date(),
    },
  });
}

export async function completeRankingRun(runId: bigint) {
  return prisma.rankingRun.update({
    where: { id: runId },
    data: {
      status: 'completed',
      finishedAt: new Date(),
    },
  });
}

export async function failRankingRun(runId: bigint, lastError: string) {
  return prisma.rankingRun.update({
    where: { id: runId },
    data: {
      status: 'failed',
      lastError,
      finishedAt: new Date(),
    },
  });
}
