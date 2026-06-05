import type { BossName } from './boss-name';

export const bossDifficulties = ['easy', 'normal', 'hard', 'chaos', 'extreme'] as const;

export type BossDifficulty = (typeof bossDifficulties)[number];

export const bossDifficultyLabels = {
  easy: '이지',
  normal: '노멀',
  hard: '하드',
  chaos: '카오스',
  extreme: '익스트림',
} as const satisfies Record<BossDifficulty, string>;

export const bossDifficultyMap = {
  자쿰: ['easy', 'normal', 'chaos'],
  매그너스: ['easy', 'normal', 'hard'],
  힐라: ['normal', 'hard'],
  파풀라투스: ['easy', 'normal', 'chaos'],
  반반: ['normal', 'chaos'],
  피에르: ['normal', 'chaos'],
  '블러디 퀸': ['normal', 'chaos'],
  벨룸: ['normal', 'chaos'],
  핑크빈: ['normal', 'chaos'],
  시그너스: ['easy', 'normal'],
  스우: ['normal', 'hard', 'extreme'],
  데미안: ['normal', 'hard'],
  '가디언 엔젤 슬라임': ['normal', 'chaos'],
  루시드: ['easy', 'normal', 'hard'],
  윌: ['easy', 'normal', 'hard'],
  더스크: ['normal', 'chaos'],
  '진 힐라': ['normal', 'hard'],
  듄켈: ['normal', 'hard'],
  '검은 마법사': ['hard', 'extreme'],
  '선택받은 세렌': ['normal', 'hard', 'extreme'],
  '감시자 칼로스': ['easy', 'normal', 'chaos', 'extreme'],
  '최초의 대적자': ['easy', 'normal', 'hard', 'extreme'],
  카링: ['easy', 'normal', 'hard', 'extreme'],
  '찬란한 흉성': ['normal', 'hard'],
  림보: ['normal', 'hard'],
  발드릭스: ['normal', 'hard'],
  유피테르: ['normal', 'hard'],
} as const satisfies Record<BossName, readonly BossDifficulty[]>;

export type BossDifficultyOf<TBossName extends BossName> = (typeof bossDifficultyMap)[TBossName][number];
