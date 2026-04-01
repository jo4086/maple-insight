export type JobCategory = 'archer' | 'mage' | 'pirate' | 'thief' | 'warrior';

export type ArcherClasses = 'bowMaster' | 'kain' | 'marksman' | 'mercedes' | 'pathfinder' | 'wildHunter' | 'windBreaker';
export type MageClasses = 'archMageFire' | 'archMageIce' | 'battleMage' | 'bishop' | 'evan' | 'flameWizard' | 'illiumn' | 'kinesis' | 'lara' | 'luminous';
export type PirateClasses = 'angelicBuster' | 'ark' | 'cannonShooter' | 'captain' | 'eunwol' | 'mechanic' | 'striker' | 'viper' | 'xenon';
export type ThiefClasses = 'cadena' | 'dualBlader' | 'hoYoung' | 'khali' | 'nightLord' | 'nightWalker' | 'phantom' | 'shadower' | 'xenon';
export type WarriorClasses =
  | 'adele'
  | 'aran'
  | 'blaster'
  | 'darkNight'
  | 'demonAvenger'
  | 'demonSlayer'
  | 'hero'
  | 'kaiser'
  | 'len'
  | 'mikhail'
  | 'paladin'
  | 'soulMaster'
  | 'zero';

export type AllJobClasses = ArcherClasses | MageClasses | PirateClasses | ThiefClasses | WarriorClasses;

export interface ClassTypes {
  archer: {
    보우마스터: 'bowMaster';
    신궁: 'marksman';
    패스파인더: 'pathfinder';
    윈드브레이커: 'windBreaker';
    와일드헌터: 'wildHunter';
    메르세데스: 'mercedes';
    카인: 'kain';
  };
  mage: {
    '아크메이지(불,독)': 'archMageFire';
    '아크메이지(썬,콜)': 'archMageIce';
    비숍: 'bishop';
    플레임위자드: 'flameWizard';
    배틀메이지: 'battleMage';
    에반: 'evan';
    루미너스: 'luminous';
    일리움: 'illium';
    라라: 'lara';
    키네시스: 'kinesis';
  };
  pirate: {
    바이퍼: 'viper';
    캡틴: 'captain';
    캐논슈터: 'cannonShooter';
    스트라이커: 'striker';
    메카닉: 'mechanic';
    제논: 'xenon';
    은월: 'eunwol';
    엔젤릭버스터: 'angelicBuster';
    아크: 'ark';
  };
  thief: {
    카데나: 'cadena';
    듀얼블레이더: 'dualBlader';
    호영: 'hoYoung';
    칼리: 'khali';
    나이트로드: 'nightLord';
    나이트워커: 'nightWalker';
    팬텀: 'phantom';
    섀도어: 'shadower';
    제논: 'xenon';
  };
  warrior: {
    아델: 'adele';
    아란: 'aran';
    블래스터: 'blaster';
    다크나이트: 'darkNight';
    데몬어벤져: 'demonAvenger';
    데몬슬레이어: 'demonSlayer';
    히어로: 'hero';
    카이저: 'kaiser';
    렌: 'len';
    미하일: 'mikhail';
    팔라딘: 'paladin';
    소울마스터: 'soulMaster';
    제로: 'zero';
  };
}
