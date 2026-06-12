import {
  classGroupKeyMap,
  isClassGroup,
  mapClassGroupKey,
  mapClassNameKey,
  resolveClassNameGroups,
} from '@maple/data-core';
import type { ClassGroup, ClassGroupKey } from '@maple/data-core';
import {
  absolabsArmorMetaMap,
  absolabsArmorStatMap,
  absolabsWeaponMetaMap,
  absolabsWeaponStatMap,
  accessoryItemNames,
  arcaneShadeArmorMetaMap,
  arcaneShadeArmorStatMap,
  arcaneShadeWeaponMetaMap,
  arcaneShadeWeaponStatMap,
  androidHeartItemMetaMap,
  badgeItemMetaMap,
  beltItemMetaMap,
  commonEquipmentRequiredClass,
  cygnusEmpressArmorMetaMap,
  destinyWeaponMetaMap,
  destinyWeaponStatMap,
  earringItemMetaMap,
  emblemItemMetaMap,
  eternalArmorMetaMap,
  eternalArmorStatMap,
  eventRingItemMetaMap,
  eyeItemMetaMap,
  fafnirWeaponMetaMap,
  fafnirWeaponStatMap,
  faceItemMetaMap,
  genesisWeaponMetaMap,
  genesisWeaponStatMap,
  medalItemMetaMap,
  pendantItemMetaMap,
  pocketItemMetaMap,
  mapEquipmentCategoryLabel,
  mapEquipmentSetDisplayName,
  mapEquipmentTypeLabel,
  mapWeaponHandTypeLabel,
  resolveEquipmentCapabilityByRule,
  resolveEquipmentBasicStats,
  ringItemMetaMap,
  rootAbyssArmorMetaMap,
  rootAbyssArmorStatMap,
  shoulderItemMetaMap,
  specialRingItemMetaMap,
  subWeaponItemMetaMap,
  weaponConstantOverrideMap,
  weaponTypeMetaMap,
  type EquipmentGenerationStatTemplate,
  type EquipmentRequiredClass,
  type EquipmentSet,
  type EquipmentCategory,
  type EquipmentCategoryLabel,
  type EquipmentCapabilityRuleType,
  type EquipmentPartLabel,
  type EquipmentType,
  type WeaponHandType,
  type WeaponHandTypeLabel,
  type WeaponType,
  type SubWeaponType,
} from '@maple/data-equipment';

type EquipmentStatJson = {
  str: number;
  dex: number;
  int: number;
  luk: number;
  maxHp: number;
  maxMp: number;
  maxDf: number;
  maxHpRate: number;
  maxMpRate: number;
  attackPower: number;
  magicPower: number;
  armor: number;
  bossDamage: number;
  ignoreMonsterArmor: number;
  criRate: number;
  criDamage: number;
  normalDamage: number;
  speed: number;
  jump: number;
  scrollCount: number;
  exceptionalScroll: number;
  specialRingLevel: number;
};

type EquipmentRequiredClassVariant = {
  part?: SubWeaponType;
  requiredClass: EquipmentRequiredClass;
  suffix?: string;
  requiredLevel?: number;
  setKey?: EquipmentSet | null;
  grantedSkills?: readonly string[];
} & EquipmentGenerationStatTemplate;

export type GeneratedEquipmentJsonItem = EquipmentStatJson & {
  name: string;
  baseName: string | null;
  category: EquipmentCategoryLabel;
  keywords: string[];
  part: EquipmentPartLabel;
  setName: string | null;
  luckyFlag: boolean;
  starforceEnabled: boolean;
  potentialEnabled: boolean;
  scrollUpgradeEnabled: boolean;
  addOptionEnabled: boolean;
  requiredLevel: number | null;
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  classGroup: ClassGroup | null;
  handType: WeaponHandTypeLabel | null;
  weaponConstant: number | null;
  grantedSkills: string[];
};

const classGroupKeyToClassGroupMap = Object.fromEntries(Object.entries(classGroupKeyMap).map(([classGroup, key]) => [key, classGroup])) as Record<ClassGroupKey, ClassGroup>;

function resolveSingleClassGroup(classGroups: readonly ClassGroup[]): ClassGroup | undefined {
  return classGroups.length === 1 ? classGroups[0] : undefined;
}

function resolveRequiredClassGroup(requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[]): ClassGroup | undefined {
  if (typeof requiredClass === 'string') {
    if (isClassGroup(requiredClass)) {
      return requiredClass;
    }

    return resolveSingleClassGroup(resolveClassNameGroups(requiredClass));
  }

  const groups = [...new Set(requiredClass.map((className) => resolveRequiredClassGroup(className)).filter((classGroup): classGroup is ClassGroup => !!classGroup))];

  return resolveSingleClassGroup(groups);
}

function resolveWeaponClassGroup(classGroup: ClassGroup | readonly ClassGroup[] | null, requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[]): ClassGroup | null {
  if (!classGroup) {
    return null;
  }

  if (typeof classGroup === 'string') {
    return classGroup;
  }

  return resolveRequiredClassGroup(requiredClass) ?? null;
}

function createWeaponClassGroupVariants(input: {
  name: string;
  classGroup: ClassGroup | readonly ClassGroup[] | null;
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  weaponConstant: number;
}): readonly {
  name: string;
  part?: SubWeaponType;
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  classGroup: ClassGroup | null;
  weaponConstant: number;
}[] {
  if (!Array.isArray(input.classGroup)) {
    return [
      {
        name: input.name,
        requiredClass: input.requiredClass,
        classGroup: resolveWeaponClassGroup(input.classGroup, input.requiredClass),
        weaponConstant: input.weaponConstant,
      },
    ];
  }

  return input.classGroup.map((classGroup) => ({
    name: `${input.name}(${classGroup})`,
    requiredClass: input.requiredClass,
    classGroup,
    weaponConstant: input.weaponConstant,
  }));
}

function createWeaponConstantOverrideVariants(input: {
  name: string;
  weaponTypeLabel: string;
}): readonly {
  name: string;
  requiredClass: EquipmentRequiredClass;
  classGroup: ClassGroup | null;
  weaponConstant: number;
}[] {
  return Object.entries(weaponConstantOverrideMap).flatMap(([requiredClass, overrideMap]) => {
    const weaponConstant = overrideMap[input.weaponTypeLabel as keyof typeof overrideMap];

    if (weaponConstant === undefined) {
      return [];
    }

    return [
      {
        name: `${input.name}(${requiredClass})`,
        requiredClass: requiredClass as EquipmentRequiredClass,
        classGroup: resolveRequiredClassGroup(requiredClass as EquipmentRequiredClass) ?? null,
        weaponConstant,
      },
    ];
  });
}

function compactKeywords(keywords: readonly (string | null | undefined | false)[]): string[] {
  return [...new Set(keywords.filter((keyword): keyword is string => typeof keyword === 'string' && keyword.length > 0))];
}

function createEquipmentKeywords(input: {
  category: EquipmentCategory;
  part: EquipmentType | WeaponType | SubWeaponType;
  setKey?: EquipmentSet | null;
  requiredClass?: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  classGroup?: ClassGroup | null;
  extraKeywords?: readonly string[];
}): string[] {
  const classGroupKey = input.classGroup ? mapClassGroupKey(input.classGroup) : null;
  const requiredClassKeywords =
    input.requiredClass === undefined
      ? []
      : typeof input.requiredClass === 'string'
        ? resolveRequiredClassKeywords(input.requiredClass)
        : input.requiredClass.flatMap((requiredClass) => resolveRequiredClassKeywords(requiredClass));

  return compactKeywords([...(input.extraKeywords ?? []), input.setKey, input.category, input.part, classGroupKey, ...requiredClassKeywords]);
}

function resolveRequiredClassKeywords(requiredClass?: EquipmentRequiredClass): string[] {
  if (!requiredClass || requiredClass === commonEquipmentRequiredClass) {
    return [];
  }

  if (isClassGroup(requiredClass)) {
    return [mapClassGroupKey(requiredClass)];
  }

  return [mapClassNameKey(requiredClass) ?? requiredClass];
}

function resolveHandTypeLabel(handType?: WeaponHandType | null): WeaponHandTypeLabel | null {
  return handType ? mapWeaponHandTypeLabel(handType) : null;
}

function normalizeStats(statTemplate: EquipmentGenerationStatTemplate, classGroup: ClassGroup | undefined): EquipmentStatJson {
  const basicStats = resolveEquipmentBasicStats({
    statTemplate,
    classGroup,
  });

  const inputAttackPower = statTemplate.attackPower ?? 0;
  const inputMagicPower = statTemplate.magicPower;
  const shouldUseMagicPower = classGroup !== undefined && mapClassGroupKey(classGroup) === 'mage' && inputMagicPower === undefined;

  return {
    ...basicStats,
    maxHp: statTemplate.maxHp ?? 0,
    maxMp: statTemplate.maxMp ?? 0,
    maxDf: statTemplate.maxDf ?? 0,
    maxHpRate: statTemplate.maxHpRate ?? 0,
    maxMpRate: statTemplate.maxMpRate ?? 0,
    attackPower: shouldUseMagicPower ? 0 : inputAttackPower,
    magicPower: statTemplate.isOppositeAttack ? (inputMagicPower ?? inputAttackPower) : (inputMagicPower ?? (shouldUseMagicPower ? inputAttackPower : 0)),
    armor: statTemplate.armor ?? 0,
    bossDamage: statTemplate.bossDamage ?? 0,
    ignoreMonsterArmor: statTemplate.ignoreMonsterArmor ?? 0,
    criRate: statTemplate.criRate ?? 0,
    criDamage: statTemplate.criDamage ?? 0,
    normalDamage: statTemplate.normalDamage ?? 0,
    speed: statTemplate.speed ?? 0,
    jump: statTemplate.jump ?? 0,
    scrollCount: statTemplate.scrollCount ?? 0,
    exceptionalScroll: statTemplate.exceptionalScroll ?? 0,
    specialRingLevel: statTemplate.specialRingLevel ?? 0,
  };
}

function resolveEquipmentRuleType(category: EquipmentCategory, part: EquipmentType | WeaponType | SubWeaponType): EquipmentCapabilityRuleType {
  return category === 'subWeapon' ? 'subWeapon' : (part as EquipmentType);
}

function createEquipmentJsonItem(input: {
  name: string;
  baseName?: string | null;
  category: EquipmentCategory;
  keywords?: readonly string[];
  part: EquipmentType | WeaponType | SubWeaponType;
  setKey: EquipmentSet | null;
  luckyFlag?: boolean;
  requiredLevel?: number | null;
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  classGroup?: ClassGroup | null;
  handType?: WeaponHandType | null;
  weaponConstant?: number | null;
  grantedSkills?: readonly string[];
  statTemplate?: EquipmentGenerationStatTemplate;
}): GeneratedEquipmentJsonItem {
  const classGroup = input.classGroup ?? resolveRequiredClassGroup(input.requiredClass) ?? null;
  const ruleType = resolveEquipmentRuleType(input.category, input.part);
  const capability = resolveEquipmentCapabilityByRule({
    part: ruleType,
    name: input.name,
    override: input.statTemplate?.capability,
  });

  return {
    name: input.name,
    baseName: input.baseName ?? null,
    category: mapEquipmentCategoryLabel(input.category),
    keywords: createEquipmentKeywords({
      category: input.category,
      part: input.part,
      setKey: input.setKey,
      requiredClass: input.requiredClass,
      classGroup,
      extraKeywords: input.keywords,
    }),
    part: mapEquipmentTypeLabel(input.part, input.category),
    setName: input.setKey ? mapEquipmentSetDisplayName(input.setKey, classGroup) : null,
    luckyFlag: input.luckyFlag ?? false,
    starforceEnabled: capability.starforceEnabled,
    potentialEnabled: capability.potentialEnabled,
    scrollUpgradeEnabled: capability.scrollUpgradeEnabled,
    addOptionEnabled: capability.addOptionEnabled,
    requiredLevel: input.requiredLevel ?? null,
    requiredClass: input.requiredClass,
    classGroup,
    handType: resolveHandTypeLabel(input.handType),
    weaponConstant: input.weaponConstant ?? null,
    grantedSkills: [...(input.grantedSkills ?? [])],
    ...normalizeStats(input.statTemplate ?? {}, classGroup ?? undefined),
  };
}

function createRequiredClassVariants(input: {
  name: string;
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  variants?: readonly EquipmentRequiredClassVariant[];
}): readonly {
  name: string;
  part?: SubWeaponType;
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  requiredLevel?: number;
  setKey?: EquipmentSet | null;
  grantedSkills?: readonly string[];
  statTemplate?: EquipmentGenerationStatTemplate;
}[] {
  if (!input.variants) {
    return [
      {
        name: input.name,
        requiredClass: input.requiredClass,
      },
    ];
  }

  return input.variants.map((variant) => {
    const { grantedSkills, part, requiredClass, requiredLevel, setKey, suffix = requiredClass, ...statTemplate } = variant;

    return {
      name: `${input.name}(${suffix})`,
      part,
      requiredClass,
      requiredLevel,
      setKey,
      grantedSkills,
      statTemplate,
    };
  });
}

function combineMap<TValue>(...maps: Partial<Record<string, TValue>>[]): Record<string, TValue> {
  return Object.assign({}, ...maps);
}

export function createWeaponEquipmentJson(): GeneratedEquipmentJsonItem[] {
  const weaponSources = [
    { keyword: 'destiny', metaMap: destinyWeaponMetaMap, statMap: destinyWeaponStatMap },
    { keyword: 'genesis', metaMap: genesisWeaponMetaMap, statMap: genesisWeaponStatMap },
    { keyword: 'arcaneShade', metaMap: arcaneShadeWeaponMetaMap, statMap: arcaneShadeWeaponStatMap },
    { keyword: 'absolabs', metaMap: absolabsWeaponMetaMap, statMap: absolabsWeaponStatMap },
    { keyword: 'fafnir', metaMap: fafnirWeaponMetaMap, statMap: fafnirWeaponStatMap },
  ] as const;

  return weaponSources.flatMap(({ keyword, metaMap, statMap }) =>
    Object.entries(metaMap).flatMap(([name, meta]) => {
      const weaponTypeMeta = weaponTypeMetaMap[meta.part];
      const variants = [
        ...createWeaponClassGroupVariants({
          name,
          classGroup: weaponTypeMeta.classGroup,
          requiredClass: meta.requiredClass,
          weaponConstant: weaponTypeMeta.weaponConstant,
        }),
        ...createWeaponConstantOverrideVariants({
          name,
          weaponTypeLabel: weaponTypeMeta.label,
        }),
      ];

      return variants.map((variant) => createEquipmentJsonItem({
        name: variant.name,
        category: meta.category,
        keywords: [keyword, meta.handType],
        part: meta.part,
        setKey: meta.setKey,
        luckyFlag: meta.luckyFlag,
        requiredLevel: meta.requiredLevel,
        requiredClass: variant.requiredClass,
        classGroup: variant.classGroup,
        handType: meta.handType,
        weaponConstant: variant.weaponConstant,
        grantedSkills: meta.grantedSkills,
        statTemplate: (statMap as Partial<Record<string, EquipmentGenerationStatTemplate>>)[name],
      }));
    }),
  );
}

export function createArmorEquipmentJson(): GeneratedEquipmentJsonItem[] {
  const armorMetaMap = combineMap(cygnusEmpressArmorMetaMap, rootAbyssArmorMetaMap, absolabsArmorMetaMap, arcaneShadeArmorMetaMap, eternalArmorMetaMap);
  const armorStatMap = combineMap(rootAbyssArmorStatMap, absolabsArmorStatMap, arcaneShadeArmorStatMap, eternalArmorStatMap);

  return Object.entries(armorMetaMap).map(([name, meta]) =>
    createEquipmentJsonItem({
      name,
      category: meta.category,
      part: meta.part,
      setKey: meta.setKey,
      requiredLevel: meta.requiredLevel,
      requiredClass: meta.classGroup ? classGroupKeyToClassGroupMap[meta.classGroup] : commonEquipmentRequiredClass,
      classGroup: meta.classGroup ? classGroupKeyToClassGroupMap[meta.classGroup] : null,
      statTemplate: armorStatMap[name],
    }),
  );
}

export function createAccessoryEquipmentJson(): GeneratedEquipmentJsonItem[] {
  const accessoryStatMap = combineMap(
    specialRingItemMetaMap,
    eventRingItemMetaMap,
    ringItemMetaMap,
    pendantItemMetaMap,
    faceItemMetaMap,
    eyeItemMetaMap,
    earringItemMetaMap,
    beltItemMetaMap,
    pocketItemMetaMap,
    badgeItemMetaMap,
    androidHeartItemMetaMap,
    shoulderItemMetaMap,
    emblemItemMetaMap,
    medalItemMetaMap,
  );

  return accessoryItemNames
    .map((name) => {
      const stat = accessoryStatMap[name];

      if (!stat) {
        return null;
      }

      return createEquipmentJsonItem({
        name,
        baseName: stat.baseName,
        category: stat.category,
        part: stat.part,
        setKey: stat.setKey,
        requiredLevel: stat.requiredLevel,
        requiredClass: stat.requiredClass,
        grantedSkills: stat.grantedSkills,
        statTemplate: stat,
      });
    })
    .filter((item): item is GeneratedEquipmentJsonItem => !!item);
}

export function createSubWeaponEquipmentJson(): GeneratedEquipmentJsonItem[] {
  return Object.entries(subWeaponItemMetaMap).flatMap(([name, stat]) => {
    const statVariants = (stat as { variants?: readonly EquipmentRequiredClassVariant[] }).variants;
    const variants = createRequiredClassVariants({
      name,
      requiredClass: stat.requiredClass,
      variants: statVariants,
    });

    return variants.map((variant) => {
      const part = variant.part ?? stat.part;

      if (!part) {
        throw new Error(`SubWeapon part is required: ${variant.name}`);
      }

      return createEquipmentJsonItem({
        name: variant.name,
        category: stat.category,
        part,
        setKey: variant.setKey ?? stat.setKey,
        requiredLevel: variant.requiredLevel ?? stat.requiredLevel,
        requiredClass: variant.requiredClass,
        grantedSkills: variant.grantedSkills ?? stat.grantedSkills,
        statTemplate: {
          ...stat,
          ...variant.statTemplate,
          capability: {
            ...stat.capability,
            ...variant.statTemplate?.capability,
          },
        },
      });
    });
  });
}

export function createEquipmentJson() {
  return {
    weapon: createWeaponEquipmentJson(),
    armor: createArmorEquipmentJson(),
    accessory: createAccessoryEquipmentJson(),
    subWeapon: createSubWeaponEquipmentJson(),
  };
}
