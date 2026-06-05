import { createAppError, formatErrorLog, isIngestorError, normalizeError } from '@@error';
import logger from '@@logger';
import type { OverallRankingEntryRaw } from '@maple/api-ranking/overall';
import { findExistingCharacterNames, findOcidByCharacterName, findSearchEligibleOcids, upsertOcid } from '@maple/db/ocid';
import {
  advanceRankingOcidCursor,
  completeRankingOcidCursor,
  failRankingOcidCursor,
  findNextCompletedRankingRunForOcidIngestion,
  findRankingRawPagesForRun,
  getOrCreateRankingOcidCursor,
  markRankingOcidCursorRunning,
} from '@maple/db/ranking';
import { recordCharacterSearch } from '@maple/db/search-history';
import { saveCharacterUnionRanking } from '@maple/db/union-ranking';

import { fetchCharacterBasic, fetchCharacterId, fetchUnionRanking } from '../clients/nexon';
import type { WorkerConfig } from '../config/env';
import { processInBatches } from '../utils/batch';
import { finishProgressLine, formatProgressBar, writeProgressLine } from '../utils/progress';

const REQUEST_BATCH_DELAY_MS = Number(process.env.REQUEST_BATCH_DELAY_MS) || 1500;

type BasicSnapshot = {
  worldName: string | null;
  guildName: string | null;
  characterName: string | null;
  className: string | null;
  level: number | null;
};

type OcidResolveProgress = {
  processedCandidateNameCount: number;
  targetCandidateNameCount: number;
  processedNewNameCount: number;
};

type OcidResolveResult = {
  processedNames: string[];
  processedCandidateNameCount: number;
  pageCompleted: boolean;
};

type OcidProgressState = {
  runId: string;
  pageFrom: number;
  pageTo: number;
  currentPage: number;
  completedPageCount: number;
  totalPageCount: number;
  processedCandidateNameCount: number;
  targetCandidateNameCount: number;
  processedNewNameCount: number;
};

function writeOcidProgress(state: OcidProgressState) {
  const line = [
    'ocids',
    formatProgressBar(state.processedCandidateNameCount, state.targetCandidateNameCount),
    `run=${state.runId}`,
    `range=${state.pageFrom}-${state.pageTo}`,
    `page=${state.currentPage}/${state.pageTo}`,
    `pages=${state.completedPageCount}/${state.totalPageCount}`,
    `pageNames=${state.processedCandidateNameCount}/${state.targetCandidateNameCount}`,
    `newOcids=${state.processedNewNameCount}`,
  ].join(' ');

  writeProgressLine(line);
}

function extractBasicSnapshot(payload: unknown): BasicSnapshot {
  if (!payload || typeof payload !== 'object') {
    return {
      worldName: null,
      guildName: null,
      characterName: null,
      className: null,
      level: null,
    };
  }

  const data = payload as {
    world_name?: unknown;
    character_guild_name?: unknown;
    character_name?: unknown;
    character_class?: unknown;
    character_level?: unknown;
  };

  return {
    worldName: typeof data.world_name === 'string' ? data.world_name : null,
    guildName: typeof data.character_guild_name === 'string' ? data.character_guild_name : null,
    characterName: typeof data.character_name === 'string' ? data.character_name : null,
    className: typeof data.character_class === 'string' ? data.character_class : null,
    level: typeof data.character_level === 'number' ? data.character_level : null,
  };
}

function isNotFoundDuringIdLookup(error: unknown) {
  if (!isIngestorError(error)) {
    return false;
  }

  const status = error.details?.status;
  return status === 400 || status === 404;
}

function isRateLimitedDuringIdLookup(error: unknown) {
  if (!isIngestorError(error)) {
    return false;
  }

  return error.details?.status === 429;
}

function extractRankingNamesFromRawPayload(rawPayload: unknown) {
  if (!Array.isArray(rawPayload)) {
    throw createAppError(502, 'ranking raw payload must be an array', {
      payloadType: typeof rawPayload,
    });
  }

  const items = rawPayload as OverallRankingEntryRaw[];
  return [...new Set(items.map((item) => item.character_name).filter(Boolean))];
}

async function resolveCharacterNamesToOcids(config: WorkerConfig, names: string[], maxNewNameCount: number, onProgress?: (progress: OcidResolveProgress) => void): Promise<OcidResolveResult> {
  const existingNames = await findExistingCharacterNames(names);
  const unresolvedNames: string[] = [];
  let processedCandidateNameCount = 0;

  for (const characterName of names) {
    if (existingNames.has(characterName)) {
      processedCandidateNameCount += 1;
      continue;
    }

    if (unresolvedNames.length >= maxNewNameCount) {
      break;
    }

    unresolvedNames.push(characterName);
    processedCandidateNameCount += 1;
  }

  let processedNewNameCount = 0;

  if (unresolvedNames.length === 0) {
    onProgress?.({
      processedCandidateNameCount: names.length,
      targetCandidateNameCount: names.length,
      processedNewNameCount,
    });
    return {
      processedNames: [],
      processedCandidateNameCount: names.length,
      pageCompleted: true,
    };
  }

  const processedNames = await processInBatches(
    unresolvedNames,
    {
      batchSize: config.requestBatchSize,
      maxFetchCount: unresolvedNames.length,
      batchDelayMs: REQUEST_BATCH_DELAY_MS,
    },
    async (batch) => {
      const settled = await Promise.allSettled(
        batch.map(async (characterName) => {
          try {
            const result = await fetchCharacterId(config, characterName);
            await upsertOcid({
              characterName,
              ocid: result.ocid,
              status: 'found',
            });
          } catch (error) {
            if (isNotFoundDuringIdLookup(error)) {
              await upsertOcid({
                characterName,
                ocid: null,
                status: 'not_found',
              });
              return;
            }

            if (isRateLimitedDuringIdLookup(error)) {
              throw error;
            }

            await upsertOcid({
              characterName,
              ocid: null,
              status: 'failed',
            });

            finishProgressLine();
            logger.warn(
              {
                characterName,
                error: formatErrorLog(error),
              },
              'character id lookup failed while processing ranking raw page',
            );
          }
        }),
      );

      const rateLimitFailure = settled.find((result) => result.status === 'rejected' && isRateLimitedDuringIdLookup(result.reason));
      if (rateLimitFailure?.status === 'rejected') {
        throw rateLimitFailure.reason;
      }

      processedNewNameCount += batch.length;
      onProgress?.({
        processedCandidateNameCount: processedCandidateNameCount - unresolvedNames.length + processedNewNameCount,
        targetCandidateNameCount: names.length,
        processedNewNameCount,
      });

      return batch;
    },
  );

  return {
    processedNames,
    processedCandidateNameCount,
    pageCompleted: processedCandidateNameCount >= names.length,
  };
}

export async function ingestOcidsFromRankingRawPages(config: WorkerConfig) {
  const run = await findNextCompletedRankingRunForOcidIngestion();

  if (!run) {
    logger.warn('no pending completed ranking run found for ocid ingestion');
    return null;
  }

  const cursor = await getOrCreateRankingOcidCursor(run.id);
  const nextPage = cursor.lastProcessedPage > 0 ? cursor.lastProcessedPage + 1 : run.pageStart;
  const startPageOffset = cursor.pageOffset;
  const pageTo = run.pageEnd;

  if (nextPage > run.pageEnd) {
    if (cursor.status !== 'completed') {
      await completeRankingOcidCursor(run.id);
    }

    logger.info(
      {
        runId: run.id.toString(),
        lastProcessedPage: cursor.lastProcessedPage,
      },
      'ocid ingestion is already complete for latest ranking run',
    );
    return {
      runId: run.id,
      processedPages: 0,
      processedNames: 0,
      completed: true,
    };
  }

  const rawPages = await findRankingRawPagesForRun(run.id, nextPage, pageTo);

  if (rawPages.length === 0) {
    logger.warn(
      {
        runId: run.id.toString(),
        pageFrom: nextPage,
        pageTo,
      },
      'no ranking raw pages found for ocid ingestion',
    );
    return null;
  }

  const totalPageCount = rawPages.length;
  const targetNameCount = rawPages.reduce((total, rawPage) => {
    const pageNames = extractRankingNamesFromRawPayload(rawPage.rawPayload);
    const offset = rawPage.page === nextPage ? startPageOffset : 0;
    return total + Math.max(0, pageNames.length - offset);
  }, 0);
  const firstPageTargetNameCount = Math.max(0, extractRankingNamesFromRawPayload(rawPages[0]?.rawPayload).length - startPageOffset);
  const startLogPayload = {
    runId: run.id.toString(),
    rankingDate: run.rankingDate,
    runPageStart: run.pageStart,
    runPageEnd: run.pageEnd,
    startPage: nextPage,
    startPageOffset,
    endPage: pageTo,
    targetPageCount: totalPageCount,
    targetNameCount,
    firstPageTargetNameCount,
    maxFetchCount: config.maxFetchCount,
    mode: config.mode,
  };

  logger.info(startLogPayload, 'ocids ingestion started');
  console.info(
    [
      'ocids start',
      `run=${startLogPayload.runId}`,
      `rankingDate=${startLogPayload.rankingDate}`,
      `startPage=${startLogPayload.startPage}`,
      `startOffset=${startLogPayload.startPageOffset}`,
      `endPage=${startLogPayload.endPage}`,
      `targetPages=${startLogPayload.targetPageCount}`,
      `remainingCandidateNames=${startLogPayload.targetNameCount}`,
      `firstPageTargetNames=${startLogPayload.firstPageTargetNameCount}`,
      `maxFetchCount=${startLogPayload.maxFetchCount}`,
      `mode=${startLogPayload.mode}`,
    ].join(' '),
  );

  await markRankingOcidCursorRunning(run.id);

  let processedPageCount = 0;
  let processedNameCount = 0;
  let lastProcessedPage: number | null = null;
  let remainingNewNameBudget = config.maxFetchCount;

  try {
    for (const rawPage of rawPages) {
      if (remainingNewNameBudget <= 0) {
        break;
      }

      const pageNames = extractRankingNamesFromRawPayload(rawPage.rawPayload);
      const pageOffset = rawPage.page === nextPage ? startPageOffset : 0;
      const names = pageNames.slice(pageOffset);
      const resolved = await resolveCharacterNamesToOcids(config, names, remainingNewNameBudget, (progress) => {
        writeOcidProgress({
          runId: run.id.toString(),
          pageFrom: nextPage,
          pageTo,
          currentPage: rawPage.page,
          completedPageCount: processedPageCount,
          totalPageCount,
          processedCandidateNameCount: progress.processedCandidateNameCount,
          targetCandidateNameCount: progress.targetCandidateNameCount,
          processedNewNameCount: progress.processedNewNameCount,
        });
      });

      const nextPageOffset = pageOffset + resolved.processedCandidateNameCount;
      const nextLastProcessedPage = resolved.pageCompleted ? rawPage.page : rawPage.page - 1;
      await advanceRankingOcidCursor({
        runId: run.id,
        lastProcessedPage: nextLastProcessedPage,
        pageOffset: resolved.pageCompleted ? 0 : nextPageOffset,
        pageCompleted: resolved.pageCompleted,
        processedNameCount: resolved.processedNames.length,
      });
      processedPageCount += resolved.pageCompleted ? 1 : 0;
      processedNameCount += resolved.processedNames.length;
      remainingNewNameBudget -= resolved.processedNames.length;
      lastProcessedPage = rawPage.page;

      writeOcidProgress({
        runId: run.id.toString(),
        pageFrom: nextPage,
        pageTo,
        currentPage: rawPage.page,
        completedPageCount: processedPageCount,
        totalPageCount,
        processedCandidateNameCount: resolved.processedCandidateNameCount,
        targetCandidateNameCount: names.length,
        processedNewNameCount: processedNameCount,
      });
      finishProgressLine();

      logger.info(
        {
          runId: run.id.toString(),
          page: rawPage.page,
          pageOffset,
          nextPageOffset,
          nextLastProcessedPage,
          pageCompleted: resolved.pageCompleted,
          processedNameCount: resolved.processedNames.length,
          remainingNewNameBudget,
          mode: config.mode,
        },
        'ranking raw page ocid ingestion finished',
      );

      if (remainingNewNameBudget <= 0) {
        break;
      }
    }

    finishProgressLine();

    const completed = lastProcessedPage !== null && lastProcessedPage >= run.pageEnd;
    if (completed) {
      await completeRankingOcidCursor(run.id);
    }

    return {
      runId: run.id,
      processedPages: processedPageCount,
      processedNames: processedNameCount,
      completed,
    };
  } catch (error) {
    finishProgressLine();
    const normalized = normalizeError(error, 'ranking raw page ocid ingestion failed', {
      runId: run.id.toString(),
      pageFrom: nextPage,
      pageTo,
    });
    await failRankingOcidCursor(run.id, normalized.message);
    throw normalized;
  }
}

export async function ingestSingleCharacterSearch(config: WorkerConfig, characterName: string) {
  try {
    const idResult = await fetchCharacterId(config, characterName);
    const ocidRow = await upsertOcid({
      characterName,
      ocid: idResult.ocid,
      status: 'found',
    });

    const basicPayload = await fetchCharacterBasic(config, idResult.ocid);
    const snapshot = extractBasicSnapshot(basicPayload);

    await recordCharacterSearch({
      ocidRowId: ocidRow.id,
      searchDate: new Date(),
      snapshot,
    });

    const unionResult = await fetchUnionRanking(config, idResult.ocid, snapshot.worldName ?? '');
    await saveCharacterUnionRanking({
      ocidRowId: ocidRow.id,
      queriedCharacterName: characterName,
      rankingDate: config.rankingDate,
      payload: unionResult.rawPayload,
      rankingItem: unionResult.ranking[0],
    });

    return {
      ocidRow,
      snapshot,
    };
  } catch (error) {
    if (isNotFoundDuringIdLookup(error)) {
      const ocidRow = await upsertOcid({
        characterName,
        ocid: null,
        status: 'not_found',
      });

      return {
        ocidRow,
        snapshot: null,
      };
    }

    await upsertOcid({
      characterName,
      ocid: null,
      status: 'failed',
    });

    throw normalizeError(error, 'single character search failed', { characterName });
  }
}

export async function refreshUnionRankingsForKnownCharacters(config: WorkerConfig) {
  const candidates = await findSearchEligibleOcids(config.maxFetchCount);

  const processed = await processInBatches(
    candidates,
    {
      batchSize: config.requestBatchSize,
      maxFetchCount: config.maxFetchCount,
      batchDelayMs: REQUEST_BATCH_DELAY_MS,
    },
    async (batch) => {
      const settled = await Promise.allSettled(
        batch.map(async (candidate) => {
          if (!candidate.ocid) {
            return null;
          }

          const basicPayload = await fetchCharacterBasic(config, candidate.ocid);
          const snapshot = extractBasicSnapshot(basicPayload);

          await recordCharacterSearch({
            ocidRowId: candidate.id,
            searchDate: new Date(),
            snapshot,
          });

          if (!snapshot.worldName) {
            throw createAppError(502, 'world_name is missing in character basic response', {
              characterName: candidate.characterName,
              ocidRowId: candidate.id.toString(),
            });
          }

          const unionResult = await fetchUnionRanking(config, candidate.ocid, snapshot.worldName);
          await saveCharacterUnionRanking({
            ocidRowId: candidate.id,
            queriedCharacterName: candidate.characterName,
            rankingDate: config.rankingDate,
            payload: unionResult.rawPayload,
            rankingItem: unionResult.ranking[0],
          });

          return candidate.id;
        }),
      );

      return settled
        .map((result, index) => {
          const candidate = batch[index];

          if (result.status === 'rejected') {
            logger.warn(
              {
                ocidRowId: candidate.id.toString(),
                characterName: candidate.characterName,
                error: formatErrorLog(result.reason),
              },
              'union ranking refresh failed',
            );
            return null;
          }

          return result.value;
        })
        .filter((value): value is bigint => value !== null);
    },
  );

  logger.info(
    {
      candidateCount: candidates.length,
      processedCount: processed.length,
    },
    'known character union ranking refresh finished',
  );

  return {
    candidateCount: candidates.length,
    processedCount: processed.length,
  };
}

export async function findExistingOcid(characterName: string) {
  return findOcidByCharacterName(characterName);
}
