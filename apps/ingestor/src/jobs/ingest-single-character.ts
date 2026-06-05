import 'dotenv/config';
import { createAppError, formatErrorLog, normalizeError } from '@@error';
import logger from '@@logger';

import { getWorkerConfig } from '@/config/env';
import { ingestSingleCharacterSearch } from '@/services/character-ingestor';

function getTargetCharacterName() {
  const name = process.env.TARGET_CHARACTER_NAME?.trim();

  if (!name) {
    throw createAppError(500, 'TARGET_CHARACTER_NAME is required', {
      envKey: 'TARGET_CHARACTER_NAME',
    });
  }

  return name;
}

async function run() {
  const config = getWorkerConfig();
  const characterName = getTargetCharacterName();

  logger.info({ characterName }, 'single character search started');

  const result = await ingestSingleCharacterSearch(config, characterName);

  logger.info(
    {
      characterName,
      ocidRowId: result.ocidRow.id.toString(),
      status: result.ocidRow.status,
    },
    'single character search finished',
  );
}

run().catch((error: unknown) => {
  const normalized = normalizeError(error, 'single character search failed');
  logger.error(formatErrorLog(normalized), 'single character search failed');
  process.exit(1);
});
