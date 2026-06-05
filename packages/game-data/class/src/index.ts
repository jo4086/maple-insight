export * from './className';
export * from './statMeta';
export * from './types';
export * from './tree';

import type { FinalClassName } from './className';

export const finalClassNameMap = {
  히어로: 'hero',
  팔라딘: 'paladin',
  다크나이트: 'dark-knight',

  '아크메이지(불,독)': 'arch-mage-fire-poison',
  '아크메이지(썬,콜)': 'arch-mage-ice-lightning',
  비숍: 'bishop',

  보우마스터: 'bow-master',
  신궁: 'marksman',
  패스파인더: 'pathfinder',

  나이트로드: 'night-lord',
  섀도어: 'shadower',
  듀얼블레이더: 'dual-blader',

  바이퍼: 'viper',
  캡틴: 'captain',
  캐논마스터: 'cannon-master',

  소울마스터: 'soul-master',
  플레임위자드: 'flame-wizard',
  윈드브레이커: 'wind-breaker',
  나이트워커: 'night-walker',
  스트라이커: 'striker',
  미하일: 'mikhail',

  아란: 'aran',
  에반: 'evan',
  메르세데스: 'mercedes',
  팬텀: 'phantom',
  은월: 'eunwol',
  루미너스: 'luminous',

  데몬슬레이어: 'demon-slayer',
  데몬어벤져: 'demon-avenger',
  배틀메이지: 'battle-mage',
  와일드헌터: 'wild-hunter',
  메카닉: 'mechanic',
  제논: 'xenon',
  블래스터: 'blaster',

  카이저: 'kaiser',
  카인: 'kain',
  카데나: 'cadena',
  엔젤릭버스터: 'angelic-buster',

  제로: 'zero',
  키네시스: 'kinesis',

  아델: 'adele',
  일리움: 'illium',
  칼리: 'khali',
  아크: 'ark',

  렌: 'len',
  라라: 'lara',
  호영: 'hoyoung',
} as const satisfies Record<FinalClassName, string>;

export type FinalClassNameKey = (typeof finalClassNameMap)[FinalClassName];
