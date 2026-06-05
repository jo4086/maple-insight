export interface RawJobRow {
  jobID: string;
  jobName: string;
}

export interface RawSkillRow {
  jobID: string;
  skillID: string;
  skillName: string;
  skillDesc: string;
  maxLevel: string;
  invisible: 'True' | 'False' | string;
  hyper: string;
  reqSkill: string;
  reqSkillLevel: string;
  reqLevel: string;
}

export interface RawSkillCommonRow {
  skillID: string;
  commonName: string;
  commonValue: string;
}

export interface RawSkillHintRow {
  skillID: string;
  desc: string;
  pdesc: string;
  h: string;
  ph: string;
  hch: string;
}

export interface RawSkillLevelRow {
  skillID: string;
  level: string;
  levelDesc: string;
}

export type RawSkillCommonMap = Record<string, string>;

export interface RawSkillAggregate {
  job: RawJobRow;
  skill: RawSkillRow;
  common: RawSkillCommonMap;
  hint?: RawSkillHintRow;
  levels: RawSkillLevelRow[];
}

export interface AggregateRawSkillsInput {
  jobs: readonly RawJobRow[];
  skills: readonly RawSkillRow[];
  commons: readonly RawSkillCommonRow[];
  hints: readonly RawSkillHintRow[];
  levels: readonly RawSkillLevelRow[];
}

export type RawSkillInjectionKind = 'classZero' | 'lineageZero' | 'conditionalZero';

export interface RawSkillRef {
  jobID: string;
  skillID: string;
  skillName: string;
  note?: string;
}

export interface RawSkillInjectionRule {
  key: string;
  kind: RawSkillInjectionKind;
  appliesTo: {
    classes?: readonly string[];
    lineages?: readonly string[];
    condition?: string;
  };
  skills: readonly RawSkillRef[];
}

export type RawSkillGroupMap<TSkill extends RawSkillRow = RawSkillRow> = Record<string, readonly TSkill[]>;

export interface FilterZeroJobSkillsOptions {
  /** 0차 전직 jobID 목록 */
  zeroJobIDs: readonly string[];
  /** true면 전체 0차 whitelist를 기본 허용 목록에 포함한다. */
  includeDefaultAllowedZeroSkills?: boolean;
  /** 기본 0차 whitelist 외에 추가로 살릴 skillID 목록 */
  additionalAllowedSkillIDs?: readonly string[];
  /** 기본 0차 whitelist 외에 추가로 살릴 skillName 목록 */
  additionalAllowedSkillNames?: readonly string[];
}

export interface ResolveClassZeroSkillIDsOptions {
  /** 최종 직업명 */
  className: string;
  /** 공용 0차처럼 별도로 살릴 skillID 목록 */
  additionalAllowedSkillIDs?: readonly string[];
  /** 공용 0차처럼 별도로 살릴 skillName 목록 */
  additionalAllowedSkillNames?: readonly string[];
}
