import logger from '@@logger';
import 'dotenv/config';

import { buildCharacterAccountGroups } from '@/services/character-group-builder';

// INFO: union-ranking 기반 계정 그룹 생성 전용 잡 엔트리다.
buildCharacterAccountGroups().catch((error: unknown) => {
  logger.error({ error }, 'character group build job failed');
  process.exit(1);
});
