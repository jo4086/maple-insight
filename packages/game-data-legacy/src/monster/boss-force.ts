import type { BossName } from './boss-name';

export const bossForceTypes = ['none', 'arcane-force', 'authentic-force'] as const;

export type BossForceType = (typeof bossForceTypes)[number];

export const bossForceTypeLabels = {
  none: '없음',
  'arcane-force': '아케인포스',
  'authentic-force': '어센틱포스',
} as const satisfies Record<BossForceType, string>;

export const bossForceTypeMap = {
  자쿰: 'none',
  매그너스: 'none',
  힐라: 'none',
  파풀라투스: 'none',
  반반: 'none',
  피에르: 'none',
  '블러디 퀸': 'none',
  벨룸: 'none',
  핑크빈: 'none',
  시그너스: 'none',
  스우: 'none',
  데미안: 'none',
  '가디언 엔젤 슬라임': 'none',
  루시드: 'arcane-force',
  윌: 'arcane-force',
  더스크: 'arcane-force',
  '진 힐라': 'arcane-force',
  듄켈: 'arcane-force',
  '검은 마법사': 'arcane-force',
  '선택받은 세렌': 'authentic-force',
  '감시자 칼로스': 'authentic-force',
  '최초의 대적자': 'authentic-force',
  카링: 'authentic-force',
  '찬란한 흉성': 'authentic-force',
  림보: 'authentic-force',
  발드릭스: 'authentic-force',
  유피테르: 'authentic-force',
} as const satisfies Record<BossName, BossForceType>;
