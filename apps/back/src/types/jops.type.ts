// 폴더 위치: /types/jobs.ts

type ValueOf<T> = T[keyof T];
type AsKey<T> = Extract<T, PropertyKey>; // PropertyKey = string | number | symbol

// 고정값: 그룹 이름
export type GroupNames = 'adventurer' | 'cygnusKnights' | 'resistance' | 'heroes';

// 고정값: 모험가 직업군별 정식 직업명
export type AdventurerJobMap = {
  warrior: 'hero' | 'paladin' | 'darkKnight';
  mage: 'archMageFP' | 'archMageIL' | 'bishop';
  archer: 'bowMaster' | 'marksman' | 'pathfinder';
  thief: 'shadower' | 'nightLord' | 'dualBlade';
  pirate: 'viper' | 'captain' | 'cannonShooter';
};

// 예시: 다른 그룹들도 같은 패턴으로 확장
export type CygnusJobMap = {
  warrior: 'soulMaster' | 'mikhail';
  mage: 'flameWizard';
  archer: 'windBreaker';
  thief: 'nightWalker';
  pirate: 'striker';
};

export type ResistanceJobMap = {
  warrior: 'blaster' | 'demonSlayer' | 'demonAvanger';
  mage: 'battleMage';
  archer: 'wildHunter';
  pirate: 'mechanic';
  xenon: 'xenon';
};

export type HeroesJobMap = {
  warrior: 'aran';
  mage: 'evan' | 'luminous';
  archer: 'mercedes';
  thief: 'phantom';
  pirate: 'eunwol';
};

// 고정값: 그룹 → 직업맵핑
export type GroupToJobMap = {
  adventurer: AdventurerJobMap;
  cygnusKnights: CygnusJobMap;
  resistance: ResistanceJobMap;
  heroes: HeroesJobMap;
};

// 유틸: 특정 그룹 G의 "모든 직업명 유니온"
// export type GroupJobUnion<G extends GroupNames> = GroupToJobMap[G][keyof GroupToJobMap[G]];
export type GroupJobUnion<G extends GroupNames> = AsKey<ValueOf<GroupToJobMap[G]>>;

// 유틸: 특정 그룹 G의 "모든 직업군 키(warrior/mage/...)" 집합
export type GroupFamilies<G extends GroupNames> = keyof GroupToJobMap[G];

// 잡 테이블 스키마
export type JobTable = {
  [G in GroupNames]: {
    // 와일드카드 섹션: base + 해당 그룹이 보유한 직업군 키별 패턴 배열
    wildcards: {
      base: string[]; // 예: ['1***', '2***']
    } & { [F in GroupFamilies<G>]: string[] }; // 예: warrior/mage/... 별 패턴들

    // 디테일 섹션: 오직 그 그룹에 속한 "정확한 직업명"만 키로 허용
    // 일부만 제공해도 되도록 Partial 처리
    details: Partial<Record<GroupJobUnion<G>, string[]>>;
  };
};
