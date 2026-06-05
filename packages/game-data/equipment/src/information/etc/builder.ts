import { createEquipmentStatBuilder } from '@/builder';
import type { EquipmentStatBuilder } from '@/builder';
import type { EquipmentCapabilityOverride, EquipmentGenerationStatInput, EquipmentGenerationStatTemplate } from '@/rule';
import type { EquipmentCategory, EquipmentRequiredClass, EquipmentSet, EquipmentType } from '@/types';

/**
 * src/information/etc/builder.ts
 *
 * 장비 이름을 key로 하는 입력용 데이터 맵 builder.
 *
 * @function createEtcStatBuilder - 장비 이름 -> 생성용 메타 + 스탯 맵 생성
 *
 * @type {EtcMeta} - 장비 공통 메타 값
 * @type {EtcItemStat} - 생성된 장비 입력 데이터 값
 * @type {EtcMetaOverride} - add()에서 덮어쓸 수 있는 메타 값
 * @type {EtcStatBuilder} - 악세서리 스탯 맵 builder
 */

/** 악세서리 공통 메타 값 */
export type EtcMeta<TPart extends EquipmentType = EquipmentType> = {
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
};

/** 악세서리 이름별 생성용 메타 + 스탯 값 */
export type EtcItemStat<TPart extends EquipmentType = EquipmentType> = EtcMeta<TPart> & EquipmentGenerationStatTemplate;

/** add()에서 덮어쓸 수 있는 메타 값 */
export type EtcMetaOverride = Partial<Pick<EtcMeta, 'requiredClass' | 'requiredLevel' | 'setKey'>>;

/** add()에서 덮어쓸 수 있는 메타 + 스탯 값 */
export type EtcItemOverride = EtcMetaOverride & EquipmentGenerationStatInput;

/** 악세서리 생성용 메타 + 스탯 맵을 단계적으로 작성하는 builder */
type EtcStatBuilder<TName extends string, TUsed extends TName, TPart extends EquipmentType> = EquipmentStatBuilder<
  TName,
  EtcItemOverride,
  EtcItemStat<TPart>,
  TUsed,
  EquipmentCapabilityOverride
>;

/**
 * INFO: 기타아이템 생성용 메타 + 스탯 맵 builder를 생성한다.
 *
 * 입력 단계에서 공통 메타와 공통 스탯을 한 번 지정하고,
 * `add()`에서는 장비별 스탯/요구 레벨/착용 가능 직업만 override한다.
 */
export function createEtcStatBuilder<TName extends string, const TPart extends EquipmentType = EquipmentType, TUsed extends TName = never>(
  baseMeta: EtcMeta<TPart>,
  baseStat: EtcItemOverride = {},
  baseCapability: EquipmentCapabilityOverride = {},
  map: Partial<Record<TName, EtcItemStat<TPart>>> = {},
): EtcStatBuilder<TName, TUsed, TPart> {
  const { requiredClass: baseStatRequiredClass, requiredLevel: baseStatRequiredLevel, setKey: baseStatSetKey, ...baseStatValue } = baseStat;

  return createEquipmentStatBuilder<TName, EtcItemOverride, EtcItemStat<TPart>, TUsed, EquipmentCapabilityOverride>({
    map,
    createValue: (_name, override = {}, capabilityOverride = {}) => {
      const { requiredClass, requiredLevel, setKey, ...statOverride } = override;
      const capability = {
        ...baseCapability,
        ...capabilityOverride,
      };

      return {
        ...baseMeta,
        ...baseStatValue,
        ...statOverride,
        ...(Object.keys(capability).length > 0 ? { capability } : {}),
        setKey: setKey ?? baseStatSetKey ?? baseMeta.setKey,
        requiredClass: requiredClass ?? baseStatRequiredClass ?? baseMeta.requiredClass,
        requiredLevel: requiredLevel ?? baseStatRequiredLevel ?? baseMeta.requiredLevel,
      };
    },
  });
}
