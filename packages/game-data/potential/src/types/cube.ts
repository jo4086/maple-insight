import type { InputStatKey } from '@maple/data-core';

const potentialGrades = ['normal', 'rare', 'epic', 'unique', 'legendary'] as const;
type PotentialGrade = (typeof potentialGrades)[number];

export const itemPotentialGrades = ['rare', 'epic', 'unique', 'legendary'] as const;
export type ItemPotentialGrade = (typeof itemPotentialGrades)[number];

export const potentialLineIndexes = [1, 2, 3] as const;
export type PotentialLineIndex = (typeof potentialLineIndexes)[number];

export type PotentialSpecialOptionKey =
  | 'attack-trigger-hp-recovery'
  | 'attack-trigger-mp-recovery'
  | 'attack-trigger-debuff-poison'
  | 'attack-trigger-debuff-stun'
  | 'attack-trigger-debuff-slow'
  | 'attack-trigger-debuff-darkness'
  | 'attack-trigger-debuff-freeze'
  | 'attack-trigger-debuff-seal';

export type PotentialOptionKey = InputStatKey | PotentialSpecialOptionKey;

export type PotentialOptionValueUnit = 'flat' | 'percent' | 'level';

export type PotentialGradeOptionTemplate = {
  /** 잠재 옵션 key */
  optionKey: PotentialOptionKey;
  /** 옵션 수치. 잡옵이라 상세 수치를 쓰지 않을 때는 생략할 수 있다. */
  value?: number;
  /** 수치 단위 */
  unit?: PotentialOptionValueUnit;
  /** 공격/피격 발동형 옵션의 발동 확률 */
  chancePercent?: number;
};

export type PotentialOptionRateRow = {
  /** 잠재 옵션 key */
  optionKey: PotentialOptionKey;
  /** 옵션 수치. 장비 레벨별 수치 공식으로 대체할 수 있다. */
  value: number;
  /** 수치 단위 */
  unit: PotentialOptionValueUnit;
  /** 공격 시 발동형 옵션의 발동 확률 */
  chancePercent?: number;
  /** 등장 확률. 단위는 percent point다. */
  rate: number;
};

export type PotentialLineOptionRateTable = Record<PotentialLineIndex, readonly PotentialOptionRateRow[]>;
export type PotentialGradeOptionRateTable = Record<ItemPotentialGrade, PotentialLineOptionRateTable>;
export type PotentialGradeOptionTemplateMap = Record<ItemPotentialGrade, readonly PotentialGradeOptionTemplate[]>;

export type PotentialOptionGradeRateRow = {
  /** 큐브 사용 전 아이템 잠재 등급 */
  itemGrade: ItemPotentialGrade;
  /** 옵션 라인 */
  line: PotentialLineIndex;
  /** 해당 라인에서 참조하는 옵션 등급 */
  optionGrade: PotentialGrade;
  /** 등장 확률. 단위는 percent point다. */
  rate: number;
};
