export const jobCategoryMap = {
  전사: 'warrior',
  마법사: 'mage',
  궁수: 'archer',
  도적: 'thief',
  해적: 'pirate',
} as const;
export type JobKo = keyof typeof jobCategoryMap;
export type JobEn = (typeof jobCategoryMap)[JobKo];

export const affiliationMap = {
  모험가: 'adventurer',
  시그너스: 'cygnus',
  레지스탕스: 'resistance',
  영웅: 'heroes',
  노바: 'nova',
  레프: 'lef',
  아니마: 'anima',
  초월자: 'overload',
  프렌즈: 'friends',
} as const;
export type AffiliationKo = keyof typeof affiliationMap;
export type AffiliationEn = (typeof affiliationMap)[AffiliationKo];

export const warriorJobMap = {
  히어로: 'hero',
  다크나이트: 'dark_night',
  팔라딘: 'paladin',
  소울마스터: 'soul_master',
  미하일: 'mikhail',
  블래스터: 'blaster',
  데몬슬레이어: 'demon_slayer',
  데몬어벤져: 'demon_avenger',
  아란: 'aran',
  카이저: 'kaiser',
  아델: 'adele',
  렌: 'len',
  제로: 'zero',
} as const;
export type WarriorJobKo = keyof typeof warriorJobMap;
export type WarriorJobEn = (typeof warriorJobMap)[WarriorJobKo];

export const mageJobMap = {
  '아크메이지(불,독)': 'arch_mage(fire)',
  '아크메이지(썬,콜)': 'arch_mage(ice)',
  비숍: 'bishop',
  플레임위자드: 'flame_wizard',
  배틀메이지: 'battle_mage',
  에반: 'evan',
  루미너스: 'luminous',
  일리움: 'illium',
  라라: 'lara',
  키네시스: 'kinesis',
} as const;
export type MageJobKo = keyof typeof mageJobMap;
export type MageJobEn = (typeof mageJobMap)[MageJobKo];

export const archerJobMap = {
  보우마스터: 'bowmaster',
  신궁: 'marksman',
  패스파인더: 'pathfinder',
  윈드브레이커: 'wind_breaker',
  와일드헌터: 'wild_hunter',
  메르세데스: 'mercedes',
  카인: 'kain',
} as const;
export type ArcherJobKo = keyof typeof archerJobMap;
export type ArcherJobEn = (typeof archerJobMap)[ArcherJobKo];

export const thiefJobMap = {
  나이트로드: 'night_lord',
  섀도어: 'shadower',
  듀얼블레이더: 'dual_blader',
  나이트워커: 'night_walker',
  제논: 'xenon_thief',
  팬텀: 'phantom',
  카데나: 'cadena',
  칼리: 'khali',
  호영: 'ho_young',
} as const;
export type ThiefJobKo = keyof typeof thiefJobMap;
export type ThiefJobEn = (typeof thiefJobMap)[ThiefJobKo];

export const pirateJobMap = {
  바이퍼: 'viper',
  캡틴: 'captain',
  캐논슈터: 'cannon_shooter',
  스트라이커: 'striker',
  메카닉: 'mechanic',
  제논: 'xenon_pirate',
  은월: 'eunwol',
  엔젤릭버스터: 'angelic_buster',
  아크: 'ark',
} as const;
export type PirateJobKo = keyof typeof pirateJobMap;
export type PirateJobEn = (typeof pirateJobMap)[PirateJobKo];
