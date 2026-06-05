import type { finalClassFileNameMap } from './job-id-map';

type FinalClassName = keyof typeof finalClassFileNameMap;
type FinalClassKey = (typeof finalClassFileNameMap)[FinalClassName];

export type SkillLineageKey =
  | 'adventurer'
  | 'cygnus'
  | 'heroes'
  | 'resistance'
  | 'demon'
  | 'nova'
  | 'transcendent'
  | 'friendsWorld'
  | 'lef'
  | 'anima';

export type SkillClassGroupKey = 'warrior' | 'mage' | 'archer' | 'thief' | 'pirate';

export type FinalClassSkillContext = {
  classKey: FinalClassKey;
  lineage: SkillLineageKey;
  classGroup: SkillClassGroupKey;
};

export const finalClassSkillContextMap = {
  히어로: { classKey: 'hero', lineage: 'adventurer', classGroup: 'warrior' },
  팔라딘: { classKey: 'paladin', lineage: 'adventurer', classGroup: 'warrior' },
  다크나이트: { classKey: 'dark-knight', lineage: 'adventurer', classGroup: 'warrior' },
  '아크메이지(불,독)': { classKey: 'arch-mage-fire-poison', lineage: 'adventurer', classGroup: 'mage' },
  '아크메이지(썬,콜)': { classKey: 'arch-mage-ice-lightning', lineage: 'adventurer', classGroup: 'mage' },
  비숍: { classKey: 'bishop', lineage: 'adventurer', classGroup: 'mage' },
  보우마스터: { classKey: 'bow-master', lineage: 'adventurer', classGroup: 'archer' },
  신궁: { classKey: 'marksman', lineage: 'adventurer', classGroup: 'archer' },
  패스파인더: { classKey: 'pathfinder', lineage: 'adventurer', classGroup: 'archer' },
  나이트로드: { classKey: 'night-lord', lineage: 'adventurer', classGroup: 'thief' },
  섀도어: { classKey: 'shadower', lineage: 'adventurer', classGroup: 'thief' },
  듀얼블레이더: { classKey: 'dual-blader', lineage: 'adventurer', classGroup: 'thief' },
  바이퍼: { classKey: 'viper', lineage: 'adventurer', classGroup: 'pirate' },
  캡틴: { classKey: 'captain', lineage: 'adventurer', classGroup: 'pirate' },
  캐논마스터: { classKey: 'cannon-master', lineage: 'adventurer', classGroup: 'pirate' },

  소울마스터: { classKey: 'soul-master', lineage: 'cygnus', classGroup: 'warrior' },
  플레임위자드: { classKey: 'flame-wizard', lineage: 'cygnus', classGroup: 'mage' },
  윈드브레이커: { classKey: 'wind-breaker', lineage: 'cygnus', classGroup: 'archer' },
  나이트워커: { classKey: 'night-walker', lineage: 'cygnus', classGroup: 'thief' },
  스트라이커: { classKey: 'striker', lineage: 'cygnus', classGroup: 'pirate' },
  미하일: { classKey: 'mikhail', lineage: 'cygnus', classGroup: 'warrior' },

  아란: { classKey: 'aran', lineage: 'heroes', classGroup: 'warrior' },
  에반: { classKey: 'evan', lineage: 'heroes', classGroup: 'mage' },
  메르세데스: { classKey: 'mercedes', lineage: 'heroes', classGroup: 'archer' },
  팬텀: { classKey: 'phantom', lineage: 'heroes', classGroup: 'thief' },
  은월: { classKey: 'eunwol', lineage: 'heroes', classGroup: 'pirate' },
  루미너스: { classKey: 'luminous', lineage: 'heroes', classGroup: 'mage' },

  데몬슬레이어: { classKey: 'demon-slayer', lineage: 'demon', classGroup: 'warrior' },
  데몬어벤져: { classKey: 'demon-avenger', lineage: 'demon', classGroup: 'warrior' },
  배틀메이지: { classKey: 'battle-mage', lineage: 'resistance', classGroup: 'mage' },
  와일드헌터: { classKey: 'wild-hunter', lineage: 'resistance', classGroup: 'archer' },
  메카닉: { classKey: 'mechanic', lineage: 'resistance', classGroup: 'pirate' },
  제논: { classKey: 'xenon', lineage: 'resistance', classGroup: 'thief' },
  블래스터: { classKey: 'blaster', lineage: 'resistance', classGroup: 'warrior' },

  카이저: { classKey: 'kaiser', lineage: 'nova', classGroup: 'warrior' },
  카인: { classKey: 'kain', lineage: 'nova', classGroup: 'archer' },
  카데나: { classKey: 'cadena', lineage: 'nova', classGroup: 'thief' },
  엔젤릭버스터: { classKey: 'angelic-buster', lineage: 'nova', classGroup: 'pirate' },

  제로: { classKey: 'zero', lineage: 'transcendent', classGroup: 'warrior' },
  키네시스: { classKey: 'kinesis', lineage: 'friendsWorld', classGroup: 'mage' },

  아델: { classKey: 'adele', lineage: 'lef', classGroup: 'warrior' },
  일리움: { classKey: 'illium', lineage: 'lef', classGroup: 'mage' },
  칼리: { classKey: 'khali', lineage: 'lef', classGroup: 'thief' },
  아크: { classKey: 'ark', lineage: 'lef', classGroup: 'pirate' },

  렌: { classKey: 'len', lineage: 'anima', classGroup: 'warrior' },
  라라: { classKey: 'lara', lineage: 'anima', classGroup: 'mage' },
  호영: { classKey: 'hoyoung', lineage: 'anima', classGroup: 'thief' },
} as const satisfies Record<FinalClassName, FinalClassSkillContext>;

export const fifthClassGroupJobIdMap = {
  warrior: '40001',
  mage: '40002',
  archer: '40003',
  thief: '40004',
  pirate: '40005',
} as const satisfies Record<SkillClassGroupKey, string>;
