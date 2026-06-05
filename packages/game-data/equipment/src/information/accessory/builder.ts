import { createEquipmentStatBuilder } from '@/builder';
import type { EquipmentStatBuilder } from '@/builder';
import type { EquipmentCapabilityOverride, EquipmentGenerationStatInput, EquipmentGenerationStatTemplate } from '@/rule';
import type { EquipmentCategory, EquipmentRequiredClass, EquipmentSet, EquipmentType } from '@/types';

/**
 * src/information/accessory/builder.ts
 *
 * 악세서리 이름을 key로 하는 입력용 데이터 맵 builder.
 *
 * @function createAccessoryStatBuilder - 악세서리 이름 -> 생성용 메타 + 스탯 맵 생성
 *
 * @type {AccessoryMeta} - 악세서리 공통 메타 값
 * @type {AccessoryItemStat} - 생성된 악세서리 입력 데이터 값
 * @type {AccessoryMetaOverride} - add()에서 덮어쓸 수 있는 메타 값
 * @type {AccessoryStatBuilder} - 악세서리 스탯 맵 builder
 */

/** 악세서리 공통 메타 값 */
export type AccessoryMeta<TPart extends EquipmentType = EquipmentType> = {
  /** 장비 대분류 key */
  category: EquipmentCategory;
  /** 실제 장비 파츠 key */
  part: TPart;
  /** 장비 세트 key. 세트가 없으면 null */
  setKey: EquipmentSet | null;
  /** 착용 가능 직업/직업군 */
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  /** 착용 요구 레벨 */
  requiredLevel?: number;
  /** 실제 API 아이템명처럼 레벨 suffix를 제외한 기준 이름 */
  baseName?: string;
  /** 장비별 강화/옵션 시스템 가능 여부 override */
  capability?: EquipmentCapabilityOverride;
  /** 장착 시 부여되는 장비 전용 스킬명 */
  grantedSkills?: readonly string[];
};

/** 악세서리 이름별 생성용 메타 + 스탯 값 */
export type AccessoryItemStat<TPart extends EquipmentType = EquipmentType> = AccessoryMeta<TPart> & EquipmentGenerationStatTemplate;

/** add()에서 덮어쓸 수 있는 메타 값 */
export type AccessoryMetaOverride = Partial<Pick<AccessoryMeta, 'baseName' | 'capability' | 'grantedSkills' | 'requiredClass' | 'requiredLevel' | 'setKey'>>;

/** add()에서 덮어쓸 수 있는 메타 + 스탯 값 */
export type AccessoryItemOverride = AccessoryMetaOverride & EquipmentGenerationStatInput;

/** 악세서리 생성용 메타 + 스탯 맵을 단계적으로 작성하는 builder */
type AccessoryStatBuilder<TName extends string, TUsed extends TName, TPart extends EquipmentType> = EquipmentStatBuilder<
  TName,
  AccessoryItemOverride,
  AccessoryItemStat<TPart>,
  TUsed,
  EquipmentCapabilityOverride
>;

/**
 * INFO: 악세서리 생성용 메타 + 스탯 맵 builder를 생성한다.
 *
 * 입력 단계에서 공통 메타와 공통 스탯을 한 번 지정하고,
 * `add()`에서는 장비별 스탯/요구 레벨/착용 가능 직업만 override한다.
 */
export function createAccessoryStatBuilder<TName extends string, const TPart extends EquipmentType = EquipmentType, TUsed extends TName = never>(
  baseMeta: AccessoryMeta<TPart>,
  baseStat: AccessoryItemOverride = {},
  baseCapability: EquipmentCapabilityOverride = {},
  map: Partial<Record<TName, AccessoryItemStat<TPart>>> = {},
): AccessoryStatBuilder<TName, TUsed, TPart> {
  const { capability: baseMetaCapability, ...baseMetaValue } = baseMeta;
  const {
    capability: baseStatCapability,
    baseName: baseStatBaseName,
    grantedSkills: baseStatGrantedSkills,
    requiredClass: baseStatRequiredClass,
    requiredLevel: baseStatRequiredLevel,
    setKey: baseStatSetKey,
    ...baseStatValue
  } = baseStat;

  return createEquipmentStatBuilder<TName, AccessoryItemOverride, AccessoryItemStat<TPart>, TUsed, EquipmentCapabilityOverride>({
    map,
    createValue: (_name, override = {}, capabilityOverride = {}) => {
      const { baseName, capability: overrideCapability, grantedSkills, requiredClass, requiredLevel, setKey, ...statOverride } = override;
      const capability = {
        ...baseMetaCapability,
        ...baseCapability,
        ...baseStatCapability,
        ...overrideCapability,
        ...capabilityOverride,
      };

      return {
        ...baseMetaValue,
        ...baseStatValue,
        ...statOverride,
        ...(Object.keys(capability).length > 0 ? { capability } : {}),
        ...(baseName ?? baseStatBaseName ?? baseMeta.baseName ? { baseName: baseName ?? baseStatBaseName ?? baseMeta.baseName } : {}),
        grantedSkills: grantedSkills ?? baseStatGrantedSkills ?? baseMeta.grantedSkills ?? [],
        setKey: setKey ?? baseStatSetKey ?? baseMetaValue.setKey,
        requiredClass: requiredClass ?? baseStatRequiredClass ?? baseMetaValue.requiredClass,
        requiredLevel: requiredLevel ?? baseStatRequiredLevel ?? baseMetaValue.requiredLevel,
      };
    },
  });
}
