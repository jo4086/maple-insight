import type { PotentialGrade } from '../types';
import type { PotentialOptionScope } from '../types/option';

export type PotentialOptionGradeKind = 'potential' | 'additional';

export type PotentialOptionGradeLevelRange = {
  min: number;
  max: number | null;
};

export type PotentialOptionGradePartCondition =
  | {
      include: readonly string[];
      exclude?: never;
    }
  | {
      include?: never;
      exclude: readonly string[];
    };

export type PotentialOptionGradeRow = {
  kind: PotentialOptionGradeKind;
  level: string;
  levelRange: PotentialOptionGradeLevelRange;
  part?: PotentialOptionGradePartCondition;
  normal?: readonly string[];
  rare?: readonly string[];
  epic?: readonly string[];
  unique?: readonly string[];
  legendary?: readonly string[];
};

export type PotentialOptionGradeTable = {
  name: string;
  source: string;
  part?: PotentialOptionGradePartCondition;
  rows: readonly PotentialOptionGradeRow[];
};

export type PotentialOptionGradeTextMap = Record<string, readonly PotentialGrade[]>;

export type PotentialOptionGradeMapByLevel = Record<string, PotentialOptionGradeTextMap>;

export type PotentialOptionTextsByGrade = Record<PotentialGrade, readonly string[]>;

export type PotentialOptionTextsByLevelGrade = Record<string, PotentialOptionTextsByGrade>;

export type PotentialOptionTextsByScope = Record<PotentialOptionScope, readonly string[]>;

export type PotentialOptionTextsByLevelGradeScope = Record<string, Record<PotentialGrade, PotentialOptionTextsByScope>>;
