import { classGroupKeyMap, type ClassGroup, type ClassGroupKey } from './base';
import {
  allClassKeyMap,
  archerClassKeyMap,
  mageClassKeyMap,
  pirateClassKeyMap,
  thiefClassKeyMap,
  warriorClassKeyMap,
  type AllClassKey,
  type AllClassName,
} from './class-group-map';

/*
 * 직업명과 직업군의 한글 이름을 내부 영문 key로 변환하고,
 * 직업명이 속한 직업군을 조회하는 taxonomy API입니다.
 *
 * 장비 생성기처럼 외부 데이터를 정규화하는 코드에서 사용하며,
 * 제논처럼 여러 직업군에 속한 직업은 모든 직업군을 반환합니다.
 */
const classGroupsForMapper = Object.keys(classGroupKeyMap) as ClassGroup[];

const classGroupClassMap = {
  전사: warriorClassKeyMap,
  마법사: mageClassKeyMap,
  궁수: archerClassKeyMap,
  도적: thiefClassKeyMap,
  해적: pirateClassKeyMap,
} as const satisfies Record<ClassGroup, Readonly<Partial<Record<AllClassName, AllClassKey>>>>;

const mutableClassNameGroupMap: Partial<Record<AllClassName, ClassGroup[]>> = {};

for (const classGroup of classGroupsForMapper) {
  const classNames = Object.keys(classGroupClassMap[classGroup]) as AllClassName[];

  for (const className of classNames) {
    (mutableClassNameGroupMap[className] ??= []).push(classGroup);
  }
}

const classNameGroupMap = Object.fromEntries(Object.entries(mutableClassNameGroupMap).map(([className, classGroups]) => [className, Object.freeze(classGroups)])) as Partial<
  Record<AllClassName, readonly ClassGroup[]>
>;

/** 직업군 이름을 내부 영문 key로 변환합니다. */
export function mapClassGroupKey(classGroup: ClassGroup): ClassGroupKey {
  return classGroupKeyMap[classGroup];
}

/** 문자열이 유효한 직업군 이름인지 판별합니다. */
export function isClassGroup(value: string): value is ClassGroup {
  return Object.hasOwn(classGroupKeyMap, value);
}

/** 직업명을 내부 영문 key로 변환하며, 등록되지 않은 이름이면 undefined를 반환합니다. */
export function mapClassNameKey(className: string): AllClassKey | undefined {
  if (!Object.hasOwn(allClassKeyMap, className)) {
    return undefined;
  }

  return allClassKeyMap[className as AllClassName];
}

/** 직업명이 속한 모든 직업군을 반환합니다. 예: 제논 -> ['도적', '해적'] */
export function resolveClassNameGroups(className: string): readonly ClassGroup[] {
  return classNameGroupMap[className as AllClassName] ?? [];
}
