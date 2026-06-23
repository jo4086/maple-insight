import type { Affiliation, AllClassName, ClassGroup, Lineage } from '@maple/data-core';

export type InternalClassGroup = ClassGroup | '미전직';
export type ClassLevel = 0 | 1 | 1.5 | 2 | 2.5 | 3 | 4 | 'hyper' | 5 | 6;

export interface GeneratedClass {
  classId: string;
  className: AllClassName;
  affiliation: Affiliation;
  lineage: Lineage;
  classGroup: InternalClassGroup[];
  classLevel: ClassLevel;
}
