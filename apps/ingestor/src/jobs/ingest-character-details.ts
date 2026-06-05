import 'dotenv/config';
import logger from '@@logger';

import { getWorkerConfig } from '@/config/env';
import { ingestOcidsFromRankingRawPages } from '@/services/character-ingestor';

const config = getWorkerConfig();

ingestOcidsFromRankingRawPages(config).catch((error: unknown) => {
  logger.error({ error }, 'ranking raw page ocid ingestion job failed');
  process.exit(1);
});
