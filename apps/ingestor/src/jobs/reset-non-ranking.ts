import 'dotenv/config';

import logger from '@@logger';
import { resetNonRankingData } from '@maple/db/admin';

async function resetNonRankingTables() {
  const result = await resetNonRankingData();

  logger.info(result, 'non-ranking tables reset finished');
}

resetNonRankingTables().catch((error: unknown) => {
  logger.error({ error }, 'non-ranking tables reset failed');
  process.exit(1);
});
