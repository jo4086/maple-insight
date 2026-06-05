import 'dotenv/config';
import logger from '@@logger';

import { getWorkerConfig } from '@/config/env';
import { runRankingIngestor } from '@/services/ranking-ingestor';

// INFO: 랭킹 수집 전용 잡 엔트리다.
const config = getWorkerConfig();

runRankingIngestor(config).catch((error: unknown) => {
  logger.error({ error }, 'ranking ingestion job failed');
  process.exit(1);
});
