import type { Affiliation, ClassGroup, ClassLineage, ClassName } from '@maple/game-data/class';

export type InternalClassGroup = ClassGroup | '미전직';
export type ClassLevel = 0 | 1 | 1.5 | 2 | 2.5 | 3 | 4 | 'hyper' | 5 | 6;

export interface GeneratedClass {
  classId: string;
  className: ClassName;
  affiliation: Affiliation;
  lineage: ClassLineage;
  classGroup: InternalClassGroup[];
  classLevel: ClassLevel;
}
