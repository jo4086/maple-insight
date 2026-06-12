import type { FinalClassNameKey } from '@maple/data-core';

import { createEquipmentStatBuilder } from '@/builder';
import type { EquipmentStatBuilder } from '@/builder';
import type { EquipmentCapabilityOverride, EquipmentGenerationStatInput, EquipmentGenerationStatTemplate } from '@/rule';
import { resolveSubWeaponRequiredClassKeys } from '@/rule/weapon';
import type { EquipmentRequiredClass, EquipmentSet, SubWeaponType } from '@/types';

/**
 * src/information/sub-weapon/builder.ts
 *
 * 보조무기 이름을 key로 하는 데이터 맵을 만들기 위한 builder 모음.
 *
 * @function createSubWeaponMetaBuilder - 보조무기 이름 -> 생성용 메타 + 스탯 맵 생성
 *
 * @type {SubWeaponMeta} - 생성된 보조무기 메타 값
 * @type {SubWeaponMetaBuilderBase} - 보조무기 공통 메타 입력값
 * @type {SubWeaponItemMeta} - 보조무기 이름별 생성용 메타 + 스탯 값
 * @type {SubWeaponItemOverride} - add()에서 덮어쓸 수 있는 메타 + 스탯 값
 * @type {SubWeaponMetaBuilder} - 보조무기 메타 맵 builder
 */

/** 같은 이름의 보조무기를 직업별 결과 아이템으로 분리할 때 사용하는 variant */
export type SubWeaponVariant = {
  /** variant의 실제 장비 파츠 */
  part?: SubWeaponType;
  /** variant 착용 가능 직업 */
  requiredClass: EquipmentRequiredClass;
  /** 생성 이름 suffix. 생략하면 requiredClass를 suffix로 사용 */
  suffix?: string;
  /** 착용 가능 최종 직업 key */
  requiredClassKeys?: readonly FinalClassNameKey[];
  /** 장비 세트 key override */
  setKey?: EquipmentSet | null;
  /** 착용 요구 레벨 override */
  requiredLevel?: number;
  /** 장비별 강화/옵션 시스템 가능 여부 override */
  capability?: EquipmentCapabilityOverride;
  /** 장착 시 부여되는 장비 전용 스킬명 */
  grantedSkills?: readonly string[];
} & EquipmentGenerationStatInput;

/** 보조무기 메타 맵의 값 타입 */
type SubWeaponMeta<TSubWeaponPart extends SubWeaponType = SubWeaponType> = {
  /** 장비 대분류 */
  category: 'subWeapon';
  /** 실제 장비 파츠. 보조무기는 보조무기 종류가 곧 part */
  part: TSubWeaponPart | null;
  /** 장비 세트 key. 세트가 없으면 null */
  setKey: EquipmentSet | null;
  /** 착용 가능 직업/직업군 */
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  /** 착용 가능 최종 직업 key */
  requiredClassKeys: readonly FinalClassNameKey[];
  /** 같은 이름의 보조무기를 직업별 결과 아이템으로 분리해야 할 때 사용하는 variant 목록 */
  variants?: readonly SubWeaponVariant[];
  /** 착용 요구 레벨 */
  requiredLevel: number;
  /** 장비별 강화/옵션 시스템 가능 여부 override */
  capability?: EquipmentCapabilityOverride;
  /** 장착 시 부여되는 장비 전용 스킬명 */
  grantedSkills: readonly string[];
};

/** 보조무기 공통 메타 입력값 */
type SubWeaponMetaBuilderBase<TSubWeaponPart extends SubWeaponType = SubWeaponType> = {
  /** 실제 장비 파츠. 보조무기는 보조무기 종류가 곧 part. 아이템별로 다르면 null/생략 후 add()에서 지정한다. */
  part?: TSubWeaponPart | null;
  /** 장비 세트 key. 입력하지 않으면 null */
  setKey?: EquipmentSet | null;
  /** 착용 요구 레벨. 입력하지 않으면 0 */
  requiredLevel?: number;
  /** 착용 가능 직업/직업군 */
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  /** 착용 가능 최종 직업 key. 생략하면 part/name 규칙으로 자동 계산 */
  requiredClassKeys?: readonly FinalClassNameKey[];
  /** 같은 이름의 보조무기를 직업별 결과 아이템으로 분리해야 할 때 사용하는 variant 목록 */
  variants?: readonly SubWeaponVariant[];
  /** 장비별 강화/옵션 시스템 가능 여부 override */
  capability?: EquipmentCapabilityOverride;
  /** 기본 장착 부여 스킬명 */
  grantedSkills?: readonly string[];
};

/** 보조무기 이름별 생성용 메타 + 스탯 값 */
type SubWeaponItemMeta<TSubWeaponPart extends SubWeaponType = SubWeaponType> = SubWeaponMeta<TSubWeaponPart> & EquipmentGenerationStatTemplate;

/** add()에서 덮어쓸 수 있는 메타 값 */
type SubWeaponItemMetaOverride = Partial<Omit<SubWeaponMeta, 'category'>>;

/** add()에서 덮어쓸 수 있는 메타 + 스탯 값 */
type SubWeaponItemOverride = SubWeaponItemMetaOverride & EquipmentGenerationStatInput;

/** 보조무기 생성용 메타 + 스탯 맵을 단계적으로 작성하는 builder */
type SubWeaponMetaBuilder<TName extends string, TUsed extends TName, TSubWeaponPart extends SubWeaponType> = EquipmentStatBuilder<
  TName,
  SubWeaponItemOverride,
  SubWeaponItemMeta<TSubWeaponPart>,
  TUsed
>;

/**
 * INFO: 보조무기 생성용 메타 + 스탯 맵 builder를 생성한다.
 *
 * 입력 단계에서 공통 메타와 공통 스탯을 한 번 지정하고,
 * `add()`에서는 장비별 스탯/요구 레벨/착용 가능 직업만 override한다.
 */
export function createSubWeaponMetaBuilder<TName extends string, const TSubWeaponPart extends SubWeaponType = SubWeaponType, TUsed extends TName = never>(
  baseMeta: SubWeaponMetaBuilderBase<TSubWeaponPart>,
  baseStat: EquipmentGenerationStatInput = {},
  map: Partial<Record<TName, SubWeaponItemMeta<TSubWeaponPart>>> = {},
): SubWeaponMetaBuilder<TName, TUsed, TSubWeaponPart> {
  const {
    capability: baseCapability,
    part: basePart = null,
    requiredClass: baseRequiredClass,
    requiredClassKeys: baseRequiredClassKeys,
    variants: baseVariants,
    requiredLevel: baseRequiredLevel = 0,
    setKey: baseSetKey = null,
  } = baseMeta;

  return createEquipmentStatBuilder<TName, SubWeaponItemOverride, SubWeaponItemMeta<TSubWeaponPart>, TUsed>({
    map,
    createValue: (name, override = {}) => {
      const { capability: capabilityOverride, grantedSkills, part, requiredClass, requiredClassKeys, requiredLevel, setKey, variants, ...statOverride } = override;
      const capability = {
        ...baseCapability,
        ...capabilityOverride,
      };
      const resolvedPart = (part ?? basePart) as TSubWeaponPart | null;

      return {
        category: 'subWeapon',
        part: resolvedPart,
        setKey: setKey ?? baseSetKey,
        requiredClass: requiredClass ?? baseRequiredClass,
        requiredClassKeys: requiredClassKeys ?? baseRequiredClassKeys ?? (resolvedPart ? resolveSubWeaponRequiredClassKeys(resolvedPart, name) : []),
        ...((variants ?? baseVariants) ? { variants: variants ?? baseVariants } : {}),
        requiredLevel: requiredLevel ?? baseRequiredLevel,
        grantedSkills: grantedSkills ?? baseMeta.grantedSkills ?? [],
        ...baseStat,
        ...statOverride,
        ...(Object.keys(capability).length > 0 ? { capability } : {}),
      };
    },
  });
}
