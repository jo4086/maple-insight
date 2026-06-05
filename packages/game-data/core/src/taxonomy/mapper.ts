import { allClassKeyMap, archerClassKeyMap, mageClassKeyMap, pirateClassKeyMap, thiefClassKeyMap, warriorClassKeyMap } from './className';
import type { ClassGroup } from './index';

const classGroupKeyMapForMapper = {
  전사: 'warrior',
  궁수: 'archer',
  마법사: 'mage',
  도적: 'thief',
  해적: 'pirate',
} as const satisfies Record<ClassGroup, string>;

const classGroupsForMapper = Object.keys(classGroupKeyMapForMapper) as ClassGroup[];

const classGroupClassMaps = [
  ['전사', warriorClassKeyMap],
  ['마법사', mageClassKeyMap],
  ['궁수', archerClassKeyMap],
  ['도적', thiefClassKeyMap],
  ['해적', pirateClassKeyMap],
] as const;

export function mapClassGroupKey(classGroup: ClassGroup) {
  return classGroupKeyMapForMapper[classGroup];
}

export function isClassGroup(value: string): value is ClassGroup {
  return classGroupsForMapper.includes(value as ClassGroup);
}

export function mapClassNameKey(className: string): string | undefined {
  return (allClassKeyMap as Partial<Record<string, string>>)[className];
}

export function resolveClassNameGroup(className: string): ClassGroup | undefined {
  return classGroupClassMaps.find(([, classKeyMap]) => className in classKeyMap)?.[0];
}
