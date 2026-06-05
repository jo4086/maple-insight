import type { BossDifficultyOf } from './boss-difficulty';
import type { BossName } from './boss-name';

export type BossPartySize = 1 | 2 | 3 | 4 | 5 | 6;

export type BossPhaseMeta = {
  level?: number;
  requiredForce?: number;
};

export type BossDifficultyMeta = {
  level?: number;
  requiredForce?: number;
  phases?: Partial<Record<number, BossPhaseMeta>>;
  entryLevel?: number;
  partySize?: BossPartySize;
  timeLimitSeconds?: number;
};

export type BossMetaTable = {
  [TBossName in BossName]?: Partial<Record<BossDifficultyOf<TBossName>, BossDifficultyMeta>>;
};

export const bossMetaMap = {
  자쿰: {
    easy: {
      level: 50,
      entryLevel: 50,
      requiredForce: 0,
      timeLimitSeconds: 1200,
      partySize: 1,
    },
    normal: {
      level: 110,
      entryLevel: 90,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    chaos: {
      level: 180,
      entryLevel: 90,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  매그너스: {
    easy: {
      level: 110,
      entryLevel: 115,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    normal: {
      level: 130,
      entryLevel: 155,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      level: 190,
      entryLevel: 175,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  힐라: {
    normal: {
      level: 120,
      entryLevel: 85,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      level: 190,
      entryLevel: 170,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  파풀라투스: {
    easy: {
      level: 125,
      entryLevel: 115,
      requiredForce: 0,
      timeLimitSeconds: 1200,
      partySize: 6,
    },
    normal: {
      level: 155,
      entryLevel: 155,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    chaos: {
      level: 190,
      entryLevel: 190,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  반반: {
    normal: {
      level: 120,
      entryLevel: 125,
      requiredForce: 0,
      timeLimitSeconds: 4800,
      partySize: 6,
    },
    chaos: {
      level: 190,
      entryLevel: 180,
      requiredForce: 0,
      timeLimitSeconds: 6000,
      partySize: 6,
    },
  },
  피에르: {
    normal: {
      level: 120,
      entryLevel: 125,
      requiredForce: 0,
      timeLimitSeconds: 900,
      partySize: 6,
    },
    chaos: {
      level: 190,
      entryLevel: 180,
      requiredForce: 0,
      timeLimitSeconds: 1200,
      partySize: 6,
    },
  },
  '블러디 퀸': {
    normal: {
      level: 120,
      entryLevel: 125,
      requiredForce: 0,
      timeLimitSeconds: 900,
      partySize: 6,
    },
    chaos: {
      level: 190,
      entryLevel: 180,
      requiredForce: 0,
      timeLimitSeconds: 1200,
      partySize: 6,
    },
  },
  벨룸: {
    normal: {
      level: 130,
      entryLevel: 125,
      requiredForce: 0,
      timeLimitSeconds: 900,
      partySize: 6,
    },
    chaos: {
      level: 190,
      entryLevel: 180,
      requiredForce: 0,
      timeLimitSeconds: 1200,
      partySize: 6,
    },
  },
  핑크빈: {
    normal: {
      level: 180,
      entryLevel: 140,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    chaos: {
      level: 190,
      entryLevel: 170,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  시그너스: {
    easy: {
      level: 140,
      entryLevel: 165,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    normal: {
      level: 190,
      entryLevel: 165,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  스우: {
    normal: {
      level: 210,
      entryLevel: 190,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      level: 210,
      entryLevel: 190,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    extreme: {
      level: 285,
      entryLevel: 190,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 2,
    },
  },
  데미안: {
    normal: {
      level: 210,
      entryLevel: 190,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      level: 210,
      entryLevel: 190,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  '가디언 엔젤 슬라임': {
    normal: {
      level: 220,
      entryLevel: 210,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    chaos: {
      level: 250,
      entryLevel: 210,
      requiredForce: 0,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  루시드: {
    easy: {
      level: 230,
      entryLevel: 220,
      requiredForce: 360,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    normal: {
      level: 230,
      entryLevel: 220,
      requiredForce: 360,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      level: 230,
      entryLevel: 220,
      requiredForce: 360,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  윌: {
    easy: {
      level: 235,
      entryLevel: 235,
      requiredForce: 560,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    normal: {
      level: 250,
      entryLevel: 235,
      requiredForce: 760,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      level: 250,
      entryLevel: 235,
      requiredForce: 760,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  더스크: {
    normal: {
      level: 255,
      entryLevel: 245,
      requiredForce: 730,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    chaos: {
      level: 255,
      entryLevel: 245,
      requiredForce: 730,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  듄켈: {
    normal: {
      level: 265,
      entryLevel: 255,
      requiredForce: 850,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      level: 265,
      entryLevel: 255,
      requiredForce: 850,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  '진 힐라': {
    normal: {
      level: 250,
      entryLevel: 250,
      requiredForce: 820,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      level: 250,
      entryLevel: 250,
      requiredForce: 900,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  '검은 마법사': {
    hard: {
      phases: {
        1: {
          level: 265,
        },
        2: {
          level: 275,
        },
        3: {
          level: 275,
        },
        4: {
          level: 265,
        },
      },
      entryLevel: 255,
      requiredForce: 1320,
      timeLimitSeconds: 3600,
      partySize: 6,
    },
    extreme: {
      phases: {
        1: {
          level: 275,
        },
        2: {
          level: 280,
        },
        3: {
          level: 280,
        },
        4: {
          level: 280,
        },
      },
      entryLevel: 255,
      requiredForce: 1320,
      timeLimitSeconds: 3600,
      partySize: 6,
    },
  },
  '선택받은 세렌': {
    normal: {
      phases: {
        1: {
          level: 270,
          requiredForce: 150,
        },
        2: {
          level: 270,
          requiredForce: 200,
        },
      },
      entryLevel: 260,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      phases: {
        1: {
          level: 275,
          requiredForce: 150,
        },
        2: {
          level: 275,
          requiredForce: 200,
        },
      },
      entryLevel: 260,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    extreme: {
      phases: {
        1: {
          level: 275,
          requiredForce: 150,
        },
        2: {
          level: 280,
          requiredForce: 200,
        },
      },
      entryLevel: 260,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  '감시자 칼로스': {
    easy: {
      level: 270,
      entryLevel: 265,
      requiredForce: 200,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    normal: {
      phases: {
        1: {
          level: 275,
          requiredForce: 250,
        },
        2: {
          level: 280,
          requiredForce: 300,
        },
      },
      entryLevel: 265,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    chaos: {
      level: 285,
      entryLevel: 265,
      requiredForce: 330,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    extreme: {
      level: 285,
      entryLevel: 265,
      requiredForce: 440,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  '최초의 대적자': {
    easy: {
      level: 270,
      entryLevel: 270,
      requiredForce: 220,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
    normal: {
      level: 280,
      entryLevel: 270,
      requiredForce: 320,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
    hard: {
      level: 285,
      entryLevel: 270,
      requiredForce: 340,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
    extreme: {
      level: 290,
      entryLevel: 270,
      requiredForce: 460,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
  },
  카링: {
    easy: {
      level: 275,
      entryLevel: 275,
      requiredForce: 230,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    normal: {
      level: 285,
      entryLevel: 275,
      requiredForce: 330,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    hard: {
      level: 285,
      entryLevel: 275,
      requiredForce: 350,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
    extreme: {
      level: 285,
      entryLevel: 275,
      requiredForce: 480,
      timeLimitSeconds: 1800,
      partySize: 6,
    },
  },
  '찬란한 흉성': {
    normal: {
      level: 280,
      entryLevel: 280,
      requiredForce: 400,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
    hard: {
      level: 280,
      entryLevel: 280,
      requiredForce: 550,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
  },
  림보: {
    normal: {
      level: 285,
      entryLevel: 285,
      requiredForce: 500,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
    hard: {
      level: 285,
      entryLevel: 285,
      requiredForce: 500,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
  },
  발드릭스: {
    normal: {
      level: 290,
      entryLevel: 290,
      requiredForce: 700,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
    hard: {
      level: 290,
      entryLevel: 290,
      requiredForce: 700,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
  },
  유피테르: {
    normal: {
      level: 295,
      entryLevel: 295,
      requiredForce: 810,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
    hard: {
      level: 295,
      entryLevel: 295,
      requiredForce: 810,
      timeLimitSeconds: 1800,
      partySize: 3,
    },
  },
} as const satisfies BossMetaTable;
