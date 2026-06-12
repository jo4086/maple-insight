import type { ClassGroup } from './base';
import type { AllClassName } from './class-group-map';

export * from './base';
export * from './class-group-map';
export * from './class';
export * from './class-tree';
export * from './generator';
export { isClassGroup, mapClassGroupKey, mapClassNameKey, resolveClassNameGroups } from './mapper';

export type EquipmentClassType = AllClassName | ClassGroup | '공용';
