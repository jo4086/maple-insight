import { fetchRankingPage } from '@@clients';
import type { WorkerConfig } from '@@env';
import { formatErrorLog, normalizeError } from '@@error';
import logger from '@@logger';
import type { OverallRankingEntryRaw } from '@maple/api-ranking/overall';
import { completeRankingRun, createRankingRun, failRankingRun, findLatestCompletedRankingRunByDate, incrementRankingRunNameCount, saveRankingRawPage } from '@maple/db/ranking';

function logRankingSummary(page: number, ranking: OverallRankingEntryRaw[]) {
  const sampleNames = ranking
    .slice(0, 5)
    .map((item) => item.character_name)
    .filter(Boolean)
    .join(', ');

  logger.info(
    {
      endpoint: 'ranking/overall',
      page,
      count: ranking.length,
      sampleNames: sampleNames || undefined,
    },
    'ranking page collected',
  );
}

function getUniqueCharacterNames(items: OverallRankingEntryRaw[]) {
  return [...new Set(items.map((item) => item.character_name).filter(Boolean))];
}

async function resolvePageWindow(config: WorkerConfig) {
  const windowSize = Math.max(1, config.pageEnd - config.pageStart + 1);
  const latestRun = await findLatestCompletedRankingRunByDate(config.rankingDate);
  const effectivePageStart = latestRun ? latestRun.pageEnd + 1 : config.pageStart;
  const effectivePageEnd = effectivePageStart + windowSize - 1;

  return {
    pageStart: effectivePageStart,
    pageEnd: effectivePageEnd,
    windowSize,
  };
}

async function collectRankingBatch(config: WorkerConfig) {
  const pageWindow = await resolvePageWindow(config);
  const run = await createRankingRun({
    rankingDate: config.rankingDate,
    pageStart: pageWindow.pageStart,
    pageEnd: pageWindow.pageEnd,
  });

  for (let page = pageWindow.pageStart; page <= pageWindow.pageEnd; page += 1) {
    try {
      const ranking = await fetchRankingPage(config, page);
      const names = getUniqueCharacterNames(ranking);

      await saveRankingRawPage(run.id, config.rankingDate, page, ranking);
      await incrementRankingRunNameCount(run.id, names.length);

      logger.info(
        {
          runId: run.id.toString(),
          savedCount: names.length,
          page,
        },
        'ranking raw page saved',
      );
      logRankingSummary(page, ranking);
    } catch (error) {
      const normalized = normalizeError(error, 'ranking page collection failed', {
        page,
        runId: run.id.toString(),
      });
      await failRankingRun(run.id, normalized.message);
      throw normalized;
    }
  }

  await completeRankingRun(run.id);
  return {
    runId: run.id,
    pageStart: pageWindow.pageStart,
    pageEnd: pageWindow.pageEnd,
  };
}

export async function runRankingIngestor(config: WorkerConfig) {
  logger.info(
    {
      intervalMs: config.intervalMs,
      pageStart: config.pageStart,
      pageEnd: config.pageEnd,
      rankingDate: config.rankingDate,
    },
    'ingestor worker started',
  );

  const startedAt = Date.now();

  try {
    const result = await collectRankingBatch(config);
    logger.info(
      {
        durationMs: Date.now() - startedAt,
        runId: result.runId.toString(),
        effectivePageStart: result.pageStart,
        effectivePageEnd: result.pageEnd,
      },
      'ranking ingestion finished',
    );
  } catch (error) {
    const normalized = normalizeError(error, 'ingestor cycle failed', {
      pageRange: `${config.pageStart}-${config.pageEnd}`,
    });

    logger.error(formatErrorLog(normalized), 'ingestor cycle failed');
    throw normalized;
  }
}
