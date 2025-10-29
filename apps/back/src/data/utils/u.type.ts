export type SkillCode = string;
export type _PrimitiveValue = string | number;

// 속성 값 → 스킬코드 배열 구조
export interface GroupedValue {
  [value: string]: SkillCode[];
}

// 속성명 → GroupedValue 배열
export interface AttributeData {
  [attribute: string]: GroupedValue[];
}

// 최종 결과의 값 구조
export interface ValueDetail {
  count: number;
  ratio: number;
  skills: SkillCode[];
}

// 최종 결과
export interface SummaryData {
  [attribute: string]: {
    length: number;
    totalCount: number;
    values: Array<{ [value: string]: ValueDetail }>;
  };
}
