import logger from '@@logger';

import { getWorkerConfig } from './config/env';

import { runRankingIngestor } from '@/services/ranking-ingestor';

import 'dotenv/config';

// INFO: 워커 시작에 필요한 실행 설정을 환경변수에서 읽는다.
const config = getWorkerConfig();

// INFO: 기본 엔트리는 랭킹 수집 잡을 실행한다.
runRankingIngestor(config).catch((error: unknown) => {
  logger.error({ error }, 'ingestor failed');
  process.exit(1);
});
