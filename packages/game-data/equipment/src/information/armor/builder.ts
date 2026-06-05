import { classGroupKeys } from '@maple/data-core';
import type { ClassGroupKey } from '@maple/data-core';

import { equipmentClassTokenRuleMap, equipmentNamePrefixRuleMap, equipmentPartSuffixRuleMap } from '@/rule';
import type { EquipmentCapabilityOverride, EquipmentGenerationStatInput, EquipmentGenerationStatTemplate, EquipmentNamePrefixRule, EquipmentPartSuffixRule } from '@/rule';
import type { ArmorType, EquipmentCategory, EquipmentType, EquipmentSet } from '@/types';

/**
 * src/information/armor/builder.ts
 *
 * 방어구 이름/메타/스탯 맵을 만들기 위한 builder 모음.
 *
 * @function createArmorName - 세트/직업군/파츠 key로 방어구 이름 생성
 * @function createArmorNameBuilder - 방어구 이름 배열 생성 builder
 * @function createArmorMetaBuilder - 방어구 이름 -> 방어구 메타 맵 생성
 * @function createArmorStatBuilder - 방어구 이름 -> 방어구 스탯 맵 생성
 * @function createArmorStatBuilderByName - 세트/파츠 입력에서 이름 타입을 추론하는 방어구 스탯 맵 생성
 * @function createArmorStatByParts - 세트의 파츠별 스탯 설정으로 방어구 스탯 맵 생성
 *
 * @type {ArmorNameBuildInput} - 방어구 이름 배열 생성 입력값
 * @type {ArmorMeta} - 생성된 방어구 메타 값
 * @type {ArmorMetaInput} - 방어구 메타 작성 시 직접 입력 가능한 값
 * @type {ArmorMetaBuilder} - 방어구 메타 맵 builder
 * @type {ArmorStatBuilder} - 방어구 스탯 맵 builder
 */

export type ArmorNamePartKey = ArmorType | 'shoulder';

type ArmorNameBuildInput = {
  /** 생성할 방어구 파츠 key */
  parts: readonly ArmorNamePartKey[];
  /** 생성할 직업군 key. 생략하면 세트 규칙에 따라 자동 결정 */
  classGroups?: readonly ClassGroupKey[];
};

const armorNamePrefixRules: Partial<Record<EquipmentSet, EquipmentNamePrefixRule>> = equipmentNamePrefixRuleMap;
const armorClassTokenRules: Partial<Record<EquipmentSet, Record<ClassGroupKey, string>>> = equipmentClassTokenRuleMap;
const armorPartSuffixRules: Partial<Record<EquipmentSet, Partial<Record<EquipmentType, EquipmentPartSuffixRule>>>> = equipmentPartSuffixRuleMap;

type ArmorPrefixOf<TSet extends EquipmentSet, TPart extends ArmorNamePartKey, TClassGroup extends ClassGroupKey> = TSet extends keyof typeof equipmentNamePrefixRuleMap
  ? (typeof equipmentNamePrefixRuleMap)[TSet] extends infer TRule
    ? TRule extends { type: 'fixed'; prefix: infer TPrefix extends string }
      ? TPrefix
      : TRule extends { type: 'part'; prefixes: infer TPrefixMap }
        ? TPart extends keyof TPrefixMap
          ? TPrefixMap[TPart] & string
          : never
        : TRule extends { type: 'classGroup'; prefixes: infer TPrefixMap }
          ? TClassGroup extends keyof TPrefixMap
            ? TPrefixMap[TClassGroup] & string
            : never
          : never
    : never
  : never;

type ArmorClassTokenOf<TSet extends EquipmentSet, TClassGroup extends ClassGroupKey> = TSet extends keyof typeof equipmentClassTokenRuleMap
  ? TClassGroup extends keyof (typeof equipmentClassTokenRuleMap)[TSet]
    ? (typeof equipmentClassTokenRuleMap)[TSet][TClassGroup] & string
    : never
  : never;

type ArmorSuffixOf<TSet extends EquipmentSet, TPart extends ArmorNamePartKey, TClassGroup extends ClassGroupKey> = TSet extends keyof typeof equipmentPartSuffixRuleMap
  ? TPart extends keyof (typeof equipmentPartSuffixRuleMap)[TSet]
    ? (typeof equipmentPartSuffixRuleMap)[TSet][TPart] extends infer TRule
      ? TRule extends { type: 'fixed'; suffix: infer TSuffix extends string }
        ? TSuffix
        : TRule extends { type: 'classGroup'; suffixes: infer TSuffixMap }
          ? TClassGroup extends keyof TSuffixMap
            ? TSuffixMap[TClassGroup] & string
            : never
          : never
      : never
    : never
  : never;

export type ArmorNameOf<TSet extends EquipmentSet, TPart extends ArmorNamePartKey, TClassGroup extends ClassGroupKey = ClassGroupKey> =
  ArmorClassTokenOf<TSet, TClassGroup> extends never
    ? `${ArmorPrefixOf<TSet, TPart, TClassGroup>} ${ArmorSuffixOf<TSet, TPart, TClassGroup>}`
    : `${ArmorPrefixOf<TSet, TPart, TClassGroup>} ${ArmorClassTokenOf<TSet, TClassGroup>}${ArmorSuffixOf<TSet, TPart, TClassGroup>}`;

type ArmorNameFromParts<TSet extends EquipmentSet, TPart extends ArmorNamePartKey, TClassGroup extends ClassGroupKey> = TPart extends ArmorNamePartKey
  ? TClassGroup extends ClassGroupKey
    ? ArmorNameOf<TSet, TPart, TClassGroup>
    : never
  : never;

export type ArmorNameFromInput<TSet extends EquipmentSet, TInput extends ArmorNameBuildInput> = ArmorNameFromParts<
  TSet,
  TInput['parts'][number],
  TInput extends { classGroups: readonly ClassGroupKey[] } ? TInput['classGroups'][number] : ClassGroupKey
>;

/** 방어구 메타 맵의 값 타입 */
type ArmorMeta<TPart extends ArmorNamePartKey = ArmorNamePartKey> = {
  /** 장비 대분류 key */
  category: EquipmentCategory;
  /** 실제 장비 파츠 key */
  part: TPart;
  /** 장비 세트 key */
  setKey: EquipmentSet;
  /** 직업군 key. 직업군 분기 장비가 아니면 null */
  classGroup: ClassGroupKey | null;
  /** 착용 요구 레벨 */
  requiredLevel: number;
};

/** 방어구 메타 작성 시 직접 입력 가능한 값 */
type ArmorMetaInput = Partial<Pick<ArmorMeta, 'category' | 'setKey' | 'classGroup' | 'requiredLevel'>>;

/** 방어구 메타 builder의 기본값 */
type ArmorMetaBuilderDefault = Required<Pick<ArmorMeta, 'category' | 'setKey' | 'classGroup' | 'requiredLevel'>>;

function resolveArmorPrefix(setKey: EquipmentSet, classGroup: ClassGroupKey | undefined, part: ArmorNamePartKey): string {
  const rule = armorNamePrefixRules[setKey];

  if (!rule) {
    throw new Error(`Missing equipment name prefix rule: ${setKey}`);
  }

  if (rule.type === 'fixed') {
    return rule.prefix;
  }

  if (rule.type === 'part') {
    const prefix = rule.prefixes[part];

    if (!prefix) {
      throw new Error(`Missing equipment name prefix rule: ${setKey}.${part}`);
    }

    return prefix;
  }

  if (!classGroup) {
    throw new Error(`Missing classGroup for equipment name prefix rule: ${setKey}`);
  }

  const prefix = rule.prefixes[classGroup];

  if (!prefix) {
    throw new Error(`Missing equipment name prefix rule: ${setKey}.${classGroup}`);
  }

  return prefix;
}

function resolveArmorClassToken(setKey: EquipmentSet, classGroup: ClassGroupKey | undefined): string | null {
  const rule = armorClassTokenRules[setKey];

  if (!rule) {
    return null;
  }

  if (!classGroup) {
    throw new Error(`Missing classGroup for equipment class token rule: ${setKey}`);
  }

  return rule[classGroup];
}

function resolveArmorSuffix(setKey: EquipmentSet, classGroup: ClassGroupKey | undefined, part: ArmorNamePartKey): string {
  const setRule = armorPartSuffixRules[setKey];
  const rule = setRule?.[part];

  if (!rule) {
    throw new Error(`Missing equipment part suffix rule: ${setKey}.${part}`);
  }

  if (rule.type === 'fixed') {
    return rule.suffix;
  }

  if (!classGroup) {
    throw new Error(`Missing classGroup for equipment part suffix rule: ${setKey}.${part}`);
  }

  const suffix = rule.suffixes[classGroup];

  if (!suffix) {
    throw new Error(`Missing equipment part suffix rule: ${setKey}.${part}.${classGroup}`);
  }

  return suffix;
}

function shouldBuildClassGroupVariants(setKey: EquipmentSet, parts: readonly ArmorNamePartKey[]): boolean {
  const prefixRule = armorNamePrefixRules[setKey];

  if (prefixRule?.type === 'classGroup') {
    return true;
  }

  if (armorClassTokenRules[setKey]) {
    return true;
  }

  return parts.some((part) => armorPartSuffixRules[setKey]?.[part]?.type === 'classGroup');
}

/** 세트/직업군/파츠 key로 방어구 이름을 생성한다. */
export function createArmorName<const TSet extends EquipmentSet, const TPart extends ArmorNamePartKey, const TClassGroup extends ClassGroupKey | undefined = undefined>(
  setKey: TSet,
  part: TPart,
  classGroup?: TClassGroup,
): ArmorNameOf<TSet, TPart, TClassGroup extends ClassGroupKey ? TClassGroup : ClassGroupKey> {
  const prefix = resolveArmorPrefix(setKey, classGroup, part);
  const classToken = resolveArmorClassToken(setKey, classGroup);
  const suffix = resolveArmorSuffix(setKey, classGroup, part);

  return (classToken ? `${prefix} ${classToken}${suffix}` : `${prefix} ${suffix}`) as ArmorNameOf<TSet, TPart, TClassGroup extends ClassGroupKey ? TClassGroup : ClassGroupKey>;
}

/**
 * INFO: 방어구 이름 배열 builder를 생성한다.
 *
 * 입력은 `setKey`, `parts`, `classGroups`처럼 key만 사용한다.
 * 생성 결과는 실제 장비명 한글 문자열 배열이다.
 */
export function createArmorNameBuilder<const TSet extends EquipmentSet, const TInput extends ArmorNameBuildInput>(setKey: TSet, input: TInput) {
  return {
    build: (): ArmorNameFromInput<TSet, TInput>[] => {
      const classGroups = input.classGroups ?? (shouldBuildClassGroupVariants(setKey, input.parts) ? classGroupKeys : [undefined]);

      return input.parts.flatMap((part) => classGroups.map((classGroup) => createArmorName(setKey, part, classGroup))) as ArmorNameFromInput<TSet, TInput>[];
    },
  };
}

/** 방어구 메타 맵을 단계적으로 작성하는 builder */
type ArmorMetaBuilder<TName extends string, TUsed extends TName> = {
  /** 방어구 이름과 파츠를 연결한다. 이미 추가한 이름은 다음 add 후보에서 제외된다. */
  add: <const TCurrentName extends Exclude<TName, TUsed>, const TPart extends ArmorNamePartKey>(
    name: TCurrentName & Exclude<TName, TUsed>,
    part: TPart,
    meta?: ArmorMetaInput,
  ) => ArmorMetaBuilder<TName, TUsed | TCurrentName>;
  /** 세트/파츠/직업군 규칙으로 이름과 메타를 한 번에 생성한다. */
  addGenerated: <const TSet extends EquipmentSet, const TInput extends ArmorNameBuildInput>(
    setKey: TSet,
    input: TInput,
    meta?: Omit<ArmorMetaInput, 'setKey' | 'classGroup'>,
  ) => ArmorMetaBuilder<TName, TUsed | (ArmorNameFromInput<TSet, TInput> & TName)>;
  /** 작성 중인 부분 맵을 반환한다. 일부 방어구가 누락되어도 허용한다. */
  done: () => Partial<Record<TName, ArmorMeta>>;
  /** 모든 방어구 이름이 작성된 경우에만 전체 맵을 반환한다. */
  doneStrict: [Exclude<TName, TUsed>] extends [never] ? () => Record<TName, ArmorMeta> : never;
};

const defaultArmorMeta: ArmorMetaBuilderDefault = {
  category: 'armor',
  setKey: 'rootAbyss',
  classGroup: null,
  requiredLevel: 0,
};

function createGeneratedArmorMetaMap<TName extends string, const TSet extends EquipmentSet, const TInput extends ArmorNameBuildInput>(
  setKey: TSet,
  input: TInput,
  defaultMeta: ArmorMetaBuilderDefault,
  meta: Omit<ArmorMetaInput, 'setKey' | 'classGroup'> = {},
): Partial<Record<TName, ArmorMeta>> {
  const classGroups = input.classGroups ?? (shouldBuildClassGroupVariants(setKey, input.parts) ? classGroupKeys : [undefined]);

  return Object.fromEntries(
    input.parts.flatMap((part) =>
      classGroups.map((classGroup) => [
        createArmorName(setKey, part, classGroup),
        {
          category: meta.category ?? defaultMeta.category,
          part,
          setKey,
          classGroup: classGroup ?? null,
          requiredLevel: meta.requiredLevel ?? defaultMeta.requiredLevel,
        },
      ]),
    ),
  ) as unknown as Partial<Record<TName, ArmorMeta>>;
}

/**
 * INFO: 방어구 메타 맵 builder를 생성한다.
 *
 * `part`, `setKey`, `classGroup`은 모두 key로 저장한다.
 * 출력 단계에서 각 label map을 통해 한글 표시명으로 변환한다.
 */
export function createArmorMetaBuilder<TName extends string, TUsed extends TName = never>(
  baseMeta: Partial<ArmorMetaBuilderDefault> = {},
  map: Partial<Record<TName, ArmorMeta>> = {},
): ArmorMetaBuilder<TName, TUsed> {
  const defaultMeta = {
    ...defaultArmorMeta,
    ...baseMeta,
  };

  return {
    add: (name, part, meta = {}) =>
      createArmorMetaBuilder<TName, TUsed | typeof name>(defaultMeta, {
        ...map,
        [name]: {
          category: meta.category ?? defaultMeta.category,
          part,
          setKey: meta.setKey ?? defaultMeta.setKey,
          classGroup: meta.classGroup ?? defaultMeta.classGroup,
          requiredLevel: meta.requiredLevel ?? defaultMeta.requiredLevel,
        },
      }),
    addGenerated: (setKey, input, meta = {}) =>
      createArmorMetaBuilder<TName, TUsed | (ArmorNameFromInput<typeof setKey, typeof input> & TName)>(defaultMeta, {
        ...map,
        ...createGeneratedArmorMetaMap<TName, typeof setKey, typeof input>(setKey, input, defaultMeta, meta),
      }),
    done: () => map,
    doneStrict: (() => map) as ArmorMetaBuilder<TName, TUsed>['doneStrict'],
  };
}

/** 방어구 스탯 맵을 단계적으로 작성하는 builder */
type ArmorStatBuilder<TName extends string, TUsed extends TName> = {
  /** 방어구 이름과 스탯 템플릿을 연결한다. 이미 추가한 이름은 다음 add 후보에서 제외된다. */
  add: <const TCurrentName extends Exclude<TName, TUsed>>(
    name: TCurrentName & Exclude<TName, TUsed>,
    stat?: EquipmentGenerationStatInput,
    capability?: EquipmentCapabilityOverride,
  ) => ArmorStatBuilder<TName, TUsed | TCurrentName>;
  /** 작성 중인 부분 맵을 반환한다. 일부 방어구가 누락되어도 허용한다. */
  done: () => Partial<Record<TName, EquipmentGenerationStatTemplate>>;
  /** 모든 방어구 이름이 작성된 경우에만 전체 맵을 반환한다. */
  doneStrict: [Exclude<TName, TUsed>] extends [never] ? () => Record<TName, EquipmentGenerationStatTemplate> : never;
};

type ArmorGeneratedStatBuilder<TName extends string, TUsed extends TName> = ArmorStatBuilder<TName, TUsed> & {
  /** 생성 규칙에 해당하는 모든 방어구 이름을 추가하고, 필요한 장비만 스탯을 override한다. */
  addGenerated: (statOverrides?: Partial<Record<TName, EquipmentGenerationStatTemplate>>) => ArmorStatBuilder<TName, TName>;
};

type ArmorPartStatConfig<TSet extends EquipmentSet, TPart extends ArmorNamePartKey> = {
  /** 해당 파츠에 공통 적용되는 기본 스탯 */
  base: EquipmentGenerationStatInput;
  /** 해당 파츠에 공통 적용되는 capability */
  capability?: EquipmentCapabilityOverride;
  /** 장비명 단위 예외 스탯 */
  overrides?: Partial<Record<ArmorNameOf<TSet, TPart>, EquipmentGenerationStatInput>>;
  /** 장비명 단위 예외 capability */
  capabilityOverrides?: Partial<Record<ArmorNameOf<TSet, TPart>, EquipmentCapabilityOverride>>;
};

type ArmorPartStatConfigMap<TSet extends EquipmentSet> = Partial<{
  [TPart in ArmorNamePartKey]: ArmorPartStatConfig<TSet, TPart>;
}>;

type ArmorNameFromPartStatConfig<TSet extends EquipmentSet, TConfig extends ArmorPartStatConfigMap<TSet>> = {
  [TPart in keyof TConfig]: TPart extends ArmorNamePartKey ? ArmorNameOf<TSet, TPart> : never;
}[keyof TConfig];

/**
 * INFO: 방어구 스탯 맵 builder를 생성한다.
 *
 * `baseStat`은 같은 묶음의 방어구가 공유하는 공통 스탯이다.
 * `add()`의 stat은 `EquipmentGenerationStatTemplate`을 사용한다.
 */
export function createArmorStatBuilder<TName extends string, TUsed extends TName = never>(
  baseStat: EquipmentGenerationStatInput = {},
  baseCapability: EquipmentCapabilityOverride = {},
  map: Partial<Record<TName, EquipmentGenerationStatTemplate>> = {},
): ArmorStatBuilder<TName, TUsed> {
  return {
    add: (name, stat = {}, capabilityOverride = {}) => {
      const capability = {
        ...baseCapability,
        ...capabilityOverride,
      };

      return createArmorStatBuilder<TName, TUsed | typeof name>(baseStat, baseCapability, {
        ...map,
        [name]: {
          ...baseStat,
          ...stat,
          ...(Object.keys(capability).length > 0 ? { capability } : {}),
        },
      });
    },
    done: () => map,
    doneStrict: (() => map) as ArmorStatBuilder<TName, TUsed>['doneStrict'],
  };
}

/**
 * INFO: 세트/파츠 입력에서 방어구 이름 타입을 추론하는 스탯 맵 builder를 생성한다.
 *
 * `TName`을 직접 넘기지 않아도 `setKey`와 `parts` 조합에 해당하는 장비명만
 * `.add()` 자동완성 후보로 잡힌다.
 */
export function createArmorStatBuilderByName<const TSet extends EquipmentSet, const TInput extends ArmorNameBuildInput>(
  setKey: TSet,
  input: TInput,
  baseStat: EquipmentGenerationStatInput = {},
  baseCapability: EquipmentCapabilityOverride = {},
): ArmorGeneratedStatBuilder<ArmorNameFromInput<TSet, TInput>, never> {
  const names = createArmorNameBuilder(setKey, input).build();
  const baseBuilder = createArmorStatBuilder<ArmorNameFromInput<TSet, TInput>>(baseStat, baseCapability);

  return {
    ...baseBuilder,
    addGenerated: (statOverrides = {}) =>
      createArmorStatBuilder<ArmorNameFromInput<TSet, TInput>, ArmorNameFromInput<TSet, TInput>>(
        baseStat,
        baseCapability,
        Object.fromEntries(
          names.map((name) => [
            name,
            {
              ...baseStat,
              ...statOverrides[name],
              ...(Object.keys(baseCapability).length > 0 ? { capability: baseCapability } : {}),
            },
          ]),
        ) as Record<ArmorNameFromInput<TSet, TInput>, EquipmentGenerationStatTemplate>,
      ),
  };
}

/**
 * INFO: 세트의 파츠별 스탯 설정으로 방어구 스탯 맵을 생성한다.
 *
 * 파츠별 `base`를 기준으로 해당 파츠의 모든 직업군 장비를 생성하고,
 * `overrides`에 적힌 장비명만 스탯을 덮어쓴다.
 */
export function createArmorStatByParts<const TSet extends EquipmentSet, const TConfig extends ArmorPartStatConfigMap<TSet>>(
  setKey: TSet,
  config: TConfig,
): Record<ArmorNameFromPartStatConfig<TSet, TConfig>, EquipmentGenerationStatTemplate> {
  const entries = Object.entries(config).flatMap(([part, partConfig]) => {
    if (!partConfig) {
      return [];
    }

    const names = createArmorNameBuilder(setKey, { parts: [part as ArmorNamePartKey] }).build();

    return names.map((name) => {
      const typedName = name as ArmorNameFromPartStatConfig<TSet, TConfig>;
      const capability = {
        ...partConfig.capability,
        ...partConfig.capabilityOverrides?.[typedName],
      };

      return [
        name,
        {
          ...partConfig.base,
          ...partConfig.overrides?.[typedName],
          ...(Object.keys(capability).length > 0 ? { capability } : {}),
        },
      ];
    });
  });

  return Object.fromEntries(entries) as Record<ArmorNameFromPartStatConfig<TSet, TConfig>, EquipmentGenerationStatTemplate>;
}
