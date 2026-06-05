import type { BossDifficultyOf } from './boss-difficulty';
import type { BossName } from './boss-name';

export type BossPhaseTargetDefenseRateMap = Record<string, number>;
export type BossPhaseDefenseRateValue = number | BossPhaseTargetDefenseRateMap;

export type BossDefenseRateTable = {
  [TBossName in BossName]?: Partial<Record<BossDifficultyOf<TBossName>, Partial<Record<number, BossPhaseDefenseRateValue>>>>;
};

export const bossDefenseRateMap = {
  자쿰: {
    easy: {
      1: 30,
    },
    normal: {
      1: 40,
    },
    chaos: {
      1: 100,
    },
  },
  매그너스: {
    easy: {
      1: 50,
    },
    normal: {
      1: 50,
    },
    hard: {
      1: 120,
    },
  },
  힐라: {
    normal: {
      1: 50,
    },
    hard: {
      1: 100,
    },
  },
  파풀라투스: {
    easy: {
      1: 50,
      2: 50,
    },
    normal: {
      1: 90,
      2: 90,
    },
    chaos: {
      1: 250,
      2: 250,
    },
  },
  반반: {
    normal: {
      1: 50,
    },
    chaos: {
      1: 100,
    },
  },
  피에르: {
    normal: {
      1: 50,
    },
    chaos: {
      1: 80,
    },
  },
  '블러디 퀸': {
    normal: {
      1: 50,
    },
    chaos: {
      1: 120,
    },
  },
  벨룸: {
    normal: {
      1: 55,
    },
    chaos: {
      1: 200,
    },
  },
  핑크빈: {
    normal: {
      1: 60,
      2: 70,
    },
    chaos: {
      1: 160,
      2: 100,
    },
  },
  시그너스: {
    easy: {
      1: 100,
    },
    normal: {
      1: 100,
    },
  },
  스우: {
    normal: {
      1: 300,
      2: 300,
      3: 300,
    },
    hard: {
      1: 300,
      2: 300,
      3: 300,
    },
    extreme: {
      1: 380,
      2: 380,
      3: 380,
    },
  },
  데미안: {
    normal: {
      1: 300,
      2: 300,
    },
    hard: {
      1: 300,
      2: 300,
    },
  },
  '가디언 엔젤 슬라임': {
    normal: {
      1: 300,
    },
    chaos: {
      1: 300,
    },
  },
  루시드: {
    easy: {
      1: 300,
      2: 300,
    },
    normal: {
      1: 300,
      2: 300,
    },
    hard: {
      1: 300,
      2: 300,
      3: 300,
    },
  },
  윌: {
    easy: {
      1: 300,
      2: 300,
      3: 300,
    },
    normal: {
      1: 300,
      2: 300,
      3: 300,
    },
    hard: {
      1: 300,
      2: 300,
      3: 300,
    },
  },
  더스크: {
    normal: {
      1: 300,
    },
    chaos: {
      1: 300,
    },
  },
  '진 힐라': {
    normal: {
      1: 300,
    },
    hard: {
      1: 300,
    },
  },
  듄켈: {
    normal: {
      1: 300,
    },
    hard: {
      1: 300,
    },
  },
  '검은 마법사': {
    hard: {
      1: 300,
      2: 300,
      3: 300,
      4: 300,
    },
    extreme: {
      1: 300,
      2: 300,
      3: 300,
      4: 300,
    },
  },
  '선택받은 세렌': {
    normal: {
      1: 380,
      2: 380,
    },
    hard: {
      1: 380,
      2: 380,
    },
    extreme: {
      1: 380,
      2: 380,
    },
  },
  '감시자 칼로스': {
    easy: {
      1: 330,
      2: 380,
    },
    normal: {
      1: 330,
      2: 380,
    },
    chaos: {
      1: 380,
      2: 380,
    },
    extreme: {
      1: 380,
      2: 380,
    },
  },
  '최초의 대적자': {
    easy: {
      1: 380,
      2: 380,
      3: 380,
    },
    normal: {
      1: 380,
      2: 380,
      3: 380,
    },
    hard: {
      1: 380,
      2: 380,
      3: 380,
    },
    extreme: {
      1: 380,
      2: 380,
      3: 380,
    },
  },
  카링: {
    easy: {
      1: 380,
      2: 380,
      3: 380,
    },
    normal: {
      1: 380,
      2: 380,
      3: 380,
    },
    hard: {
      1: 380,
      2: 380,
      3: 380,
    },
    extreme: {
      1: 380,
      2: 380,
      3: 380,
    },
  },
  '찬란한 흉성': {
    normal: {
      1: 380,
    },
    hard: {
      1: 380,
    },
  },
  림보: {
    normal: {
      1: 380,
      2: 380,
      3: 380,
    },
    hard: {
      1: 380,
      2: 380,
      3: 380,
    },
  },
  발드릭스: {
    normal: {
      1: 380,
      2: 380,
    },
    hard: {
      1: 380,
      2: 380,
    },
  },
  유피테르: {
    normal: {
      1: 380,
    },
    hard: {
      1: 380,
    },
  },
} as const satisfies BossDefenseRateTable;
