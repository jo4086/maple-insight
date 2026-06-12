export const warriorClassKeyMap = {
  검사: 'swordman',
  파이터: 'fighter',
  크루세이더: 'crusader',
  히어로: 'hero',
  페이지: 'page',
  나이트: 'white-knight',
  팔라딘: 'paladin',
  스피어맨: 'spearman',
  버서커: 'berserker',
  다크나이트: 'dark-knight',
  소울마스터: 'soul-master',
  미하일: 'mikhail',
  아란: 'aran',
  블래스터: 'blaster',
  데몬슬레이어: 'demon-slayer',
  데몬어벤져: 'demon-avenger',
  카이저: 'kaiser',
  제로: 'zero',
  아델: 'adele',
  렌: 'len',
} as const;

export const mageClassKeyMap = {
  메지션: 'magician',
  '위자드(불,독)': 'wizard-fire-poison',
  '메이지(불,독)': 'mage-fire-poison',
  '아크메이지(불,독)': 'arch-mage-fire-poison',
  '위자드(썬,콜)': 'wizard-ice-lightning',
  '메이지(썬,콜)': 'mage-ice-lightning',
  '아크메이지(썬,콜)': 'arch-mage-ice-lightning',
  클레릭: 'cleric',
  프리스트: 'priest',
  비숍: 'bishop',
  플레임위자드: 'flame-wizard',
  에반: 'evan',
  루미너스: 'luminous',
  배틀메이지: 'battle-mage',
  키네시스: 'kinesis',
  일리움: 'illium',
  라라: 'lara',
} as const;

export const archerClassKeyMap = {
  아처: 'archer',
  헌터: 'hunter',
  레인저: 'ranger',
  보우마스터: 'bow-master',
  사수: 'crossbowman',
  저격수: 'sniper',
  신궁: 'marksman',
  '에이션트 아처': 'ancient-archer',
  체이서: 'chaser',
  패스파인더: 'pathfinder',
  윈드브레이커: 'wind-breaker',
  메르세데스: 'mercedes',
  와일드헌터: 'wild-hunter',
  카인: 'kain',
} as const;

export const thiefClassKeyMap = {
  로그: 'rogue',
  어쌔신: 'assassin',
  허밋: 'hermit',
  나이트로드: 'night-lord',
  시프: 'thief',
  시프마스터: 'thief-master',
  섀도어: 'shadower',
  세미듀어러: 'semi-dueler',
  듀어러: 'dueler',
  듀얼마스터: 'dual-master',
  슬래셔: 'slasher',
  듀얼블레이더: 'dual-blader',
  나이트워커: 'night-walker',
  팬텀: 'phantom',
  제논: 'xenon',
  카데나: 'cadena',
  칼리: 'khali',
  호영: 'hoyoung',
} as const;

export const pirateClassKeyMap = {
  해적: 'pirate',
  인파이터: 'infighter',
  버커니어: 'buccaneer',
  바이퍼: 'viper',
  건슬링거: 'gunslinger',
  발키리: 'valkyrie',
  캡틴: 'captain',
  캐논슈터: 'cannon-shooter',
  캐논블래스터: 'cannon-blaster',
  캐논마스터: 'cannon-master',
  스트라이커: 'striker',
  은월: 'eunwol',
  제논: 'xenon',
  메카닉: 'mechanic',
  엔젤릭버스터: 'angelic-buster',
  아크: 'ark',
} as const;

export const baseClassKeyMap = {
  초보자: 'beginner',
  노블레스: 'noblesse',
  시티즌: 'citizen',
} as const;

export const allClassKeyMap = {
  ...warriorClassKeyMap,
  ...mageClassKeyMap,
  ...archerClassKeyMap,
  ...thiefClassKeyMap,
  ...pirateClassKeyMap,
  ...baseClassKeyMap,
} as const;

export type WarriorClassName = keyof typeof warriorClassKeyMap;
export type WarriorClassKey = (typeof warriorClassKeyMap)[WarriorClassName];
export const warriorClassNames = Object.keys(warriorClassKeyMap) as WarriorClassName[];
export const warriorClassKeys = Object.values(warriorClassKeyMap) as WarriorClassKey[];

export type MageClassName = keyof typeof mageClassKeyMap;
export type MageClassKey = (typeof mageClassKeyMap)[MageClassName];
export const mageClassNames = Object.keys(mageClassKeyMap) as MageClassName[];
export const mageClassKeys = Object.values(mageClassKeyMap) as MageClassKey[];

export type ArcherClassName = keyof typeof archerClassKeyMap;
export type ArcherClassKey = (typeof archerClassKeyMap)[ArcherClassName];
export const archerClassNames = Object.keys(archerClassKeyMap) as ArcherClassName[];
export const archerClassKeys = Object.values(archerClassKeyMap) as ArcherClassKey[];

export type ThiefClassName = keyof typeof thiefClassKeyMap;
export type ThiefClassKey = (typeof thiefClassKeyMap)[ThiefClassName];
export const thiefClassNames = Object.keys(thiefClassKeyMap) as ThiefClassName[];
export const thiefClassKeys = Object.values(thiefClassKeyMap) as ThiefClassKey[];

export type PirateClassName = keyof typeof pirateClassKeyMap;
export type PirateClassKey = (typeof pirateClassKeyMap)[PirateClassName];
export const pirateClassNames = Object.keys(pirateClassKeyMap) as PirateClassName[];
export const pirateClassKeys = Object.values(pirateClassKeyMap) as PirateClassKey[];

export type AllClassName = keyof typeof allClassKeyMap;
export type AllClassKey = (typeof allClassKeyMap)[AllClassName];
export const allClassNames = Object.keys(allClassKeyMap) as AllClassName[];
export const allClassKeys = Object.values(allClassKeyMap) as AllClassKey[];
