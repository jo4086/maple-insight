import type { ClassGroup, FinalClassNameKey } from '@maple/data-core';

import type { EquipmentRequiredClass, WeaponHandType } from '@/types';

/**
 * src/rule/weapon/builder.ts
 *
 * @function createWeaponPartMetaBuilder
 * @function createSubWeaponPartMetaBuilder
 *
 * @type {WeaponPartMeta}
 * @type {WeaponPartMetaInput}
 * @type {WeaponPartMetaBuilder}
 *
 * @type {SubWeaponPartMeta}
 * @type {SubWeaponPartMetaInput}
 * @type {SubWeaponPartMetaBuilder}
 * */

/** 무기 종류 메타 */
export type WeaponPartMeta = {
  /** 무기 종류 한글 표기 */
  label: string;
  /** 한손/두손 여부 */
  handType: WeaponHandType;
  /** 착용 가능 직업군. 전용 무기처럼 직업군으로 표현하기 애매하면 null */
  classGroup: ClassGroup | readonly ClassGroup[] | null;
  /** 착용 가능 직업. 직업군만으로 충분하면 null */
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[] | null;
};

/** 무기 종류 메타 작성 입력값 */
export type WeaponPartMetaInput = Pick<WeaponPartMeta, 'label' | 'handType'> & {
  /** 착용 가능 직업군 */
  classGroup?: WeaponPartMeta['classGroup'];
  /** 착용 가능 직업. 생략하면 null */
  requiredClass?: WeaponPartMeta['requiredClass'];
};

/** 무기 종류 메타 맵 builder */
export type WeaponPartMetaBuilder<TKey extends string, TUsed extends TKey> = {
  /** 무기 종류 key와 메타를 연결한다. 이미 추가한 key는 다음 add 후보에서 제외된다. */
  add: <const TCurrentKey extends Exclude<TKey, TUsed>>(key: TCurrentKey, meta: WeaponPartMetaInput) => WeaponPartMetaBuilder<TKey, TUsed | TCurrentKey>;
  /** 한손 무기 종류 key와 메타를 연결한다. */
  oneHanded: <const TCurrentKey extends Exclude<TKey, TUsed>>(
    key: TCurrentKey,
    label: string,
    classGroup?: WeaponPartMeta['classGroup'],
    requiredClass?: WeaponPartMeta['requiredClass'],
  ) => WeaponPartMetaBuilder<TKey, TUsed | TCurrentKey>;
  /** 두손 무기 종류 key와 메타를 연결한다. */
  twoHanded: <const TCurrentKey extends Exclude<TKey, TUsed>>(
    key: TCurrentKey,
    label: string,
    classGroup?: WeaponPartMeta['classGroup'],
    requiredClass?: WeaponPartMeta['requiredClass'],
  ) => WeaponPartMetaBuilder<TKey, TUsed | TCurrentKey>;
  /** 작성 중인 부분 맵을 반환한다. 일부 무기 종류가 누락되어도 허용한다. */
  done: () => Partial<Record<TKey, WeaponPartMeta>>;
  /** 모든 무기 종류 key가 작성된 경우에만 전체 맵을 반환한다. */
  doneStrict: [Exclude<TKey, TUsed>] extends [never] ? () => Record<TKey, WeaponPartMeta> : never;
};

/** 무기 종류 메타 맵 builder를 생성한다. */
export function createWeaponPartMetaBuilder<const TKeys extends readonly string[], TKey extends TKeys[number] = TKeys[number], TUsed extends TKey = never>(
  keys: TKeys,
  map: Partial<Record<TKey, WeaponPartMeta>> = {},
): WeaponPartMetaBuilder<TKey, TUsed> {
  void keys;

  return {
    add: (key, meta) =>
      createWeaponPartMetaBuilder<TKeys, TKey, TUsed | typeof key>(keys, {
        ...map,
        [key]: {
          ...meta,
          classGroup: meta.classGroup ?? null,
          requiredClass: meta.requiredClass ?? null,
        },
      }),
    oneHanded: (key, label, classGroup = null, requiredClass = null) =>
      createWeaponPartMetaBuilder<TKeys, TKey, TUsed | typeof key>(keys, {
        ...map,
        [key]: {
          label,
          handType: 'oneHanded',
          classGroup,
          requiredClass,
        },
      }),
    twoHanded: (key, label, classGroup = null, requiredClass = null) =>
      createWeaponPartMetaBuilder<TKeys, TKey, TUsed | typeof key>(keys, {
        ...map,
        [key]: {
          label,
          handType: 'twoHanded',
          classGroup,
          requiredClass,
        },
      }),
    done: () => map,
    doneStrict: (() => map) as WeaponPartMetaBuilder<TKey, TUsed>['doneStrict'],
  };
}

/** 보조무기 종류 메타 */
export type SubWeaponPartMeta = {
  /** 보조무기 종류 한글 표기 */
  label: string;
  /** 착용 가능 직업 key */
  requiredClassKeys: readonly FinalClassNameKey[];
};

/** 보조무기 종류 메타 작성 입력값 */
export type SubWeaponPartMetaInput = {
  /** 보조무기 종류 한글 표기 */
  label: string;
  /** 착용 가능 직업 key. 생략하면 빈 배열 */
  requiredClassKeys?: readonly FinalClassNameKey[];
};

/** 보조무기 종류 메타 맵 builder */
export type SubWeaponPartMetaBuilder<TKey extends string, TUsed extends TKey> = {
  /** 보조무기 종류 key와 메타를 연결한다. 이미 추가한 key는 다음 add 후보에서 제외된다. */
  add: <const TCurrentKey extends Exclude<TKey, TUsed>>(key: TCurrentKey, meta: SubWeaponPartMetaInput) => SubWeaponPartMetaBuilder<TKey, TUsed | TCurrentKey>;
  /** 작성 중인 부분 맵을 반환한다. 일부 보조무기 종류가 누락되어도 허용한다. */
  done: () => Partial<Record<TKey, SubWeaponPartMeta>>;
  /** 모든 보조무기 종류 key가 작성된 경우에만 전체 맵을 반환한다. */
  doneStrict: [Exclude<TKey, TUsed>] extends [never] ? () => Record<TKey, SubWeaponPartMeta> : never;
};

/** 보조무기 종류 메타 맵 builder를 생성한다. */
export function createSubWeaponPartMetaBuilder<const TKeys extends readonly string[], TKey extends TKeys[number] = TKeys[number], TUsed extends TKey = never>(
  keys: TKeys,
  map: Partial<Record<TKey, SubWeaponPartMeta>> = {},
): SubWeaponPartMetaBuilder<TKey, TUsed> {
  void keys;

  return {
    add: (key, meta) =>
      createSubWeaponPartMetaBuilder<TKeys, TKey, TUsed | typeof key>(keys, {
        ...map,
        [key]: {
          ...meta,
          requiredClassKeys: meta.requiredClassKeys ?? [],
        },
      }),
    done: () => map,
    doneStrict: (() => map) as SubWeaponPartMetaBuilder<TKey, TUsed>['doneStrict'],
  };
}
