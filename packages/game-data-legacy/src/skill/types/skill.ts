export type CommonSkillGroup =
  | 'all'
  | 'adventurer'
  | 'adventurerWarrior'
  | 'adventurerMage'
  | 'adventurerArcher'
  | 'adventurerThief'
  | 'adventurerPirate'
  | 'cygnus'
  | 'resistance'
  | 'demon'
  | 'heroes'
  | 'transcendent'
  | 'friendsWorld'
  | 'nova'
  | 'lef'
  | 'anima'
  | 'warrior'
  | 'mage'
  | 'archer'
  | 'thief'
  | 'pirate';

// MEMO: skill.ts 타입
export type SkillLinkedGroup<TSkillName extends string = string> =
  | readonly TSkillName[]
  | {
      /** 묶음 표시명 */
      name: string;
      /** 레벨이 같이 오르는 스킬 목록 */
      skills: readonly TSkillName[];
    };

export type SkillLinkedGroups<TSkillName extends string = string> = readonly SkillLinkedGroup<TSkillName>[];

export interface SkillTriggeredGroup<TSkillName extends string = string> {
  trigger: TSkillName;
  skills: readonly TSkillName[];
}

export interface SkillDerivedCondition<TSkillName extends string = string> {
  /** 파생 방식. additional: 원본에 추가 발동, replace: 원본 대신 발동 */
  kind?: 'additional' | 'replace';
  /** 파생 발동에 필요한 버프/상태 스킬 */
  requiredSkillState?: TSkillName | readonly TSkillName[];
  /** 파생 발동에 필요한 태그 */
  requiredTags?: readonly string[];
  /** 파생 발동 주기, 초 단위 */
  intervalSec?: number;
  /** 조건 설명 메모 */
  desc?: string;
}

export interface SkillDerivedGroup<TSkillName extends string = string> {
  /** 관계 분류/검색용 태그 */
  tags?: readonly string[];
  /** 관계 설명 메모 */
  desc?: string;
  source: TSkillName | readonly TSkillName[];
  condition?: SkillDerivedCondition<TSkillName>;
  skills: readonly TSkillName[];
}

export type SkillUpgradeChains<TSkillName extends string = string> = readonly (readonly TSkillName[])[];

export interface ZeroSkillSet {
  active?: readonly string[];
  activeToggle?: readonly string[];
  passive?: readonly string[];
  internalSkills?: readonly string[];
  commonGroup?: readonly CommonSkillGroup[];
}

export interface SkillByDisplayType {
  active: readonly string[];
  activeToggle?: readonly string[];
  passive: readonly string[];
  internalSkills?: readonly string[];
  linkedGroups?: SkillLinkedGroups;
  derivedGroups?: readonly SkillDerivedGroup[];
}

export interface FifthSkillDisplayType {
  classActive: readonly string[];
  enhancement: readonly string[];
  internalSkills?: readonly string[];
  commonGroup: readonly CommonSkillGroup[];
  linkedGroups?: SkillLinkedGroups;
  derivedGroups?: readonly SkillDerivedGroup[];
}

export interface SixthSkillDisplayType {
  classActive: readonly string[];
  mastery: readonly string[];
  enhancement: readonly string[];
  internalSkills?: readonly string[];
  commonGroup: readonly CommonSkillGroup[];
  linkedGroups?: SkillLinkedGroups;
  derivedGroups?: readonly SkillDerivedGroup[];
}

export interface ClassSkillSet {
  link: readonly string[];
  zero: ZeroSkillSet;
  first: SkillByDisplayType;
  second: SkillByDisplayType;
  third: SkillByDisplayType;
  fourth: SkillByDisplayType;
  hyper: SkillByDisplayType;
  fifth: FifthSkillDisplayType;
  sixth: SixthSkillDisplayType;
  triggeredGroups?: readonly SkillTriggeredGroup[];
  derivedGroups?: readonly SkillDerivedGroup[];
  upgradeChains?: SkillUpgradeChains;
}

export interface DualBladeSkillSet extends ClassSkillSet {
  firstPlus: SkillByDisplayType;
  secondPlus: SkillByDisplayType;
}

// MEMO:

export type SkillNameOf<T> = T extends readonly (infer U)[] ? U : T extends object ? { [K in keyof T]: SkillNameOf<T[K]> }[keyof T] : never;

export type SkillNameFromSkillSet<T> = Exclude<Extract<SkillNameOf<T>, string>, CommonSkillGroup>;

// MEMO: common Skill 타입
export interface CommonSkillSet {
  special: SkillByDisplayType;
  zero: SkillByDisplayType;
  fourth: SkillByDisplayType;
  fifth: {
    active: readonly string[];
    internalSkills?: readonly string[];
    linkedGroups?: SkillLinkedGroups;
    passive: readonly string[];
  };
  sixth: {
    active: readonly string[];
    internalSkills?: readonly string[];
    linkedGroups?: SkillLinkedGroups;
    derivedGroups?: readonly SkillDerivedGroup[];
  };
}
