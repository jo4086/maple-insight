export type JobGroup = 'warrior' | 'mage' | 'archer' | 'thief' | 'pirate' | 'etc';
export type JobAffiliation =
  | 'Adventurer'
  | 'Cygnus'
  | 'Heroes'
  | 'Resistance'
  | 'Nova'
  | 'Lef'
  | 'Anima'
  | 'Overlord'
  | 'Friends';

export interface JobMeta {
  code: string;
  name: string;
  group: JobGroup;
  affiliation: JobAffiliation;
}

export const JobMetaMap: Record<string, JobMeta> = {
  // Adventurer
  hero: { code: '011', name: 'hero', group: 'warrior', affiliation: 'Adventurer' },
  paladin: { code: '012', name: 'paladin', group: 'warrior', affiliation: 'Adventurer' },
  darkNight: { code: '013', name: 'darkNight', group: 'warrior', affiliation: 'Adventurer' },
  archMageFire: { code: '021', name: 'archMageFire', group: 'mage', affiliation: 'Adventurer' },
  archMageIce: { code: '022', name: 'archMageIce', group: 'mage', affiliation: 'Adventurer' },
  bishop: { code: '023', name: 'bishop', group: 'mage', affiliation: 'Adventurer' },
  bowMaster: { code: '031', name: 'bowMaster', group: 'archer', affiliation: 'Adventurer' },
  marksman: { code: '032', name: 'marksman', group: 'archer', affiliation: 'Adventurer' },
  pathfinder: { code: '033', name: 'pathfinder', group: 'archer', affiliation: 'Adventurer' },
  nightLord: { code: '041', name: 'nightLord', group: 'thief', affiliation: 'Adventurer' },
  shadower: { code: '042', name: 'shadower', group: 'thief', affiliation: 'Adventurer' },
  dualBlader: { code: '043', name: 'dualBlader', group: 'thief', affiliation: 'Adventurer' },
  viper: { code: '051', name: 'viper', group: 'pirate', affiliation: 'Adventurer' },
  captain: { code: '052', name: 'captain', group: 'pirate', affiliation: 'Adventurer' },
  cannonShooter: { code: '053', name: 'cannonShooter', group: 'pirate', affiliation: 'Adventurer' },

  // Cygnus
  soulMaster: { code: '111', name: 'soulMaster', group: 'warrior', affiliation: 'Cygnus' },
  mikhail: { code: '112', name: 'mikhail', group: 'warrior', affiliation: 'Cygnus' },
  flameWizard: { code: '121', name: 'flameWizard', group: 'mage', affiliation: 'Cygnus' },
  windBreaker: { code: '131', name: 'windBreaker', group: 'archer', affiliation: 'Cygnus' },
  nightWalker: { code: '141', name: 'nightWalker', group: 'thief', affiliation: 'Cygnus' },
  striker: { code: '151', name: 'striker', group: 'pirate', affiliation: 'Cygnus' },

  // Heroes
  aran: { code: '211', name: 'aran', group: 'warrior', affiliation: 'Heroes' },
  evan: { code: '221', name: 'evan', group: 'mage', affiliation: 'Heroes' },
  luminous: { code: '222', name: 'luminous', group: 'mage', affiliation: 'Heroes' },
  mercedes: { code: '231', name: 'mercedes', group: 'archer', affiliation: 'Heroes' },
  phantom: { code: '241', name: 'phantom', group: 'thief', affiliation: 'Heroes' },
  eunwol: { code: '251', name: 'eunwol', group: 'pirate', affiliation: 'Heroes' },

  // Resistance & Demon
  demonSlayer: { code: '311', name: 'demonSlayer', group: 'warrior', affiliation: 'Resistance' },
  demonAvenger: { code: '312', name: 'demonAvenger', group: 'warrior', affiliation: 'Resistance' },
  blaster: { code: '313', name: 'blaster', group: 'warrior', affiliation: 'Resistance' },
  battleMage: { code: '321', name: 'battleMage', group: 'mage', affiliation: 'Resistance' },
  wildHunter: { code: '331', name: 'wildHunter', group: 'archer', affiliation: 'Resistance' },
  mechanic: { code: '351', name: 'mechanic', group: 'pirate', affiliation: 'Resistance' },
  xenon: { code: '361', name: 'xenon', group: 'pirate', affiliation: 'Resistance' },

  // Nova
  kaiser: { code: '411', name: 'kaiser', group: 'warrior', affiliation: 'Nova' },
  kain: { code: '431', name: 'kain', group: 'archer', affiliation: 'Nova' },
  cadena: { code: '441', name: 'cadena', group: 'thief', affiliation: 'Nova' },
  angelicBuster: { code: '451', name: 'angelicBuster', group: 'pirate', affiliation: 'Nova' },

  // Lef
  adele: { code: '511', name: 'adele', group: 'warrior', affiliation: 'Lef' },
  illium: { code: '521', name: 'illium', group: 'mage', affiliation: 'Lef' },
  khali: { code: '541', name: 'khali', group: 'thief', affiliation: 'Lef' },
  ark: { code: '551', name: 'ark', group: 'pirate', affiliation: 'Lef' },

  // Anima
  len: { code: '611', name: 'len', group: 'warrior', affiliation: 'Anima' },
  lara: { code: '621', name: 'lara', group: 'mage', affiliation: 'Anima' },
  hoYoung: { code: '641', name: 'hoYoung', group: 'thief', affiliation: 'Anima' },

  // Overlord
  zero: { code: '1011', name: 'zero', group: 'warrior', affiliation: 'Overlord' },

  // Friends
  kinesis: { code: '2021', name: 'kinesis', group: 'mage', affiliation: 'Friends' },
};

/*
 * 1: warrior | 2: mage | 3: archer | 4: thief | 5: pirate | 0: all
 */
type WildcardClassLine = '1' | '2' | '3' | '4' | '5' | '0';
/*
 * Ad: Adventurer
 * Cy: Cygnus Knights
 * Re: Resistance
 * De: Demon
 * He: Heroes
 * No: Nova
 * Le: Lef
 * An: Anima
 * Ov: Over Lord
 * Fr: Friends World
 * Cm: All
 * */
type WildcardAffiliation = 'Ad' | 'Cy' | 'Re' | 'De' | 'He' | 'No' | 'Le' | 'An' | 'Ov' | 'Fr' | 'Cm';

// Ad
/*
 * [rule]
 * => 맨우측 *: 전직차수
 * => 2번째: 직업군의 순번
 * => 3번째: 직업군 (전사:1 법사:2, 궁수:3, 도적:4, 해적:5, 기타:6)
 * => 3번째 이후 왼쪽의 숫자들
 *    0: 모험가
 *    1: 시그너스
 *    2: 영웅
 *    3: 레지스탕스&데몬
 *    4: 노바
 *    5: 레프
 *    6: 아니마
 *    10: 초월자
 *    20: 프렌즈 월드
 *
 ** 모험가: 0(공백) + ___
 * 011*: 히어로
 * 012*: 팔라딘
 * 013*: 다크나이트
 *
 * 021*: 아크메이지(불,독)
 * 022*: 아크메이지(썬,콜)
 * 023*: 비숍
 *
 * 031*: 보우마스터
 * 032*: 신궁
 * 033*: 패스파인더
 *
 * 041*: 나이트로드
 * 042*: 섀도어
 * 043*: 듀얼블레이더
 *
 * 051*: 바이퍼
 * 052*: 캡틴
 * 053*: 캐논슈터
 *
 ** 시그너스 - 1 + ___
 * 111*: 소울마스터
 * 112*: 미하일
 * 121*: 플레임위자드
 * 131*: 윈드브레이커
 * 141*: 나이트워커
 * 151*: 스트라이커
 *
 * 영웅 - 2 + ___
 * 211*: 아란
 * 221*: 에반
 * 222*: 루미너스
 * 231*: 메르세데스
 * 241*: 팬텀
 * 251*: 은월
 *
 * 레지스탕스 - 3 + ___
 * 311*: 데몬슬레이어
 * 312*: 데몬어벤져
 * 313*: 블래스터
 * 321*: 배틀메이지
 * 331*: 와일드헌터
 * 351*: 메카닉
 * 361*: 제논
 *
 * 노바 - 4 + ___
 * 411*: 카이저
 * 431*: 카인
 * 441*: 카데나
 * 451*: 엔젤릭버스터
 *
 * 레프 - 5 + ___
 * 511*: 아델
 * 521*: 일리움
 * 541*: 칼리
 * 551*: 아크
 *
 * 아니마 - 6 + ___
 * 611*: 렌
 * 621*: 라라
 * 641*: 호영
 *
 * 초월자 - 10 + ___
 * 1011*: 제로
 *
 * 프렌즈 - 20 + ___
 * 2021*: 키네시스
 * */
