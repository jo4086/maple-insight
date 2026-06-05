import type { EquipmentType } from '@/types';

/**
 * src/rule/capability/builder.ts
 *
 * 장비 파츠별 기본 capability와 아이템별 override를 함께 작성하기 위한 builder다.
 *
 * @function createEquipmentCapabilityRuleBuilder
 *
 * @type {EquipmentCapability}
 * @type {EquipmentCapabilityOverride}
 * @type {EquipmentCapabilityItemRule}
 * @type {EquipmentCapabilityRule}
 * @type {EquipmentCapabilityRuleBuilder}
 */

export type EquipmentCapabilityRuleType = EquipmentType | 'subWeapon';

/** 장비가 사용할 수 있는 강화/옵션 시스템 플래그 */
export type EquipmentCapability = {
  /** 잠재능력 가능 여부 */
  potentialEnabled: boolean;
  /** 스타포스 가능 여부 */
  starforceEnabled: boolean;
  /** 주문서 강화 가능 여부 */
  scrollUpgradeEnabled: boolean;
  /** 추가 옵션(추옵) 가능 여부 */
  addOptionEnabled: boolean;
};

/** 아이템별로 덮어쓸 capability 값 */
export type EquipmentCapabilityOverride = Partial<EquipmentCapability>;

/** 특정 파츠에 속한 아이템 이름 기반 override 규칙 */
export type EquipmentCapabilityItemRule<TPart extends EquipmentCapabilityRuleType = EquipmentCapabilityRuleType> = {
  /** 장비 파츠 key */
  part: TPart;
  /** 아이템 이름 */
  name: string;
  /** 덮어쓸 capability 값 */
  override: EquipmentCapabilityOverride;
};

/** 장비 capability 규칙 결과 */
export type EquipmentCapabilityRule<TPart extends EquipmentCapabilityRuleType = EquipmentCapabilityRuleType> = {
  /** 파츠별 기본 capability */
  defaults: Partial<Record<TPart, EquipmentCapability>>;
  /** 아이템 이름 기반 override */
  items: readonly EquipmentCapabilityItemRule<TPart>[];
};

export type EquipmentCapabilityRuleBuilder<TPart extends EquipmentCapabilityRuleType> = {
  /**
   * 파츠별 기본 capability를 추가한다.
   *
   * 이미 같은 파츠를 추가했다면 뒤에 작성한 값으로 덮어쓴다.
   */
  part: <const TCurrentPart extends TPart>(part: TCurrentPart, capability: EquipmentCapability) => EquipmentCapabilityRuleBuilder<TPart>;
  /** 특정 파츠의 아이템 이름 기반 override를 추가한다. */
  add: <const TCurrentPart extends TPart>(
    part: TCurrentPart,
    name: string,
    override: EquipmentCapabilityOverride,
  ) => EquipmentCapabilityRuleBuilder<TPart>;
  /** 작성한 capability 규칙을 반환한다. */
  done: () => EquipmentCapabilityRule<TPart>;
};

export type ResolveEquipmentCapabilityInput<TPart extends EquipmentCapabilityRuleType = EquipmentCapabilityRuleType> = {
  /** capability를 판정할 장비 파츠 key */
  part: TPart;
  /** 아이템 이름 */
  name: string;
  /** 아이템 입력 데이터에서 직접 전달한 override */
  override?: EquipmentCapabilityOverride;
};

type CreateEquipmentCapabilityRuleBuilderOptions<TPart extends EquipmentCapabilityRuleType> = {
  defaults?: Partial<Record<TPart, EquipmentCapability>>;
  items?: readonly EquipmentCapabilityItemRule<TPart>[];
};

/** 장비 capability 규칙 builder를 생성한다. */
export function createEquipmentCapabilityRuleBuilder<
  const TParts extends readonly EquipmentCapabilityRuleType[],
  TPart extends TParts[number] = TParts[number],
>(
  parts: TParts,
  options: CreateEquipmentCapabilityRuleBuilderOptions<TPart> = {},
): EquipmentCapabilityRuleBuilder<TPart> {
  void parts;

  const defaults = options.defaults ?? {};
  const items = options.items ?? [];

  return {
    part: (part, capability) =>
      createEquipmentCapabilityRuleBuilder<TParts, TPart>(parts, {
        defaults: {
          ...defaults,
          [part]: capability,
        },
        items,
      }),
    add: (part, name, override) =>
      createEquipmentCapabilityRuleBuilder<TParts, TPart>(parts, {
        defaults,
        items: [
          ...items,
          {
            part,
            name,
            override,
          },
        ],
      }),
    done: () => ({
      defaults,
      items,
    }),
  };
}

/** 장비 capability 규칙과 아이템별 override를 합쳐 최종 capability를 계산한다. */
export function resolveEquipmentCapability<TPart extends EquipmentCapabilityRuleType>(
  rule: EquipmentCapabilityRule<TPart>,
  input: ResolveEquipmentCapabilityInput<TPart>,
  fallback: EquipmentCapability,
): EquipmentCapability {
  const partDefault = rule.defaults[input.part] ?? fallback;
  const itemOverride = rule.items.find((item) => item.part === input.part && item.name === input.name)?.override;

  return {
    ...fallback,
    ...partDefault,
    ...itemOverride,
    ...input.override,
  };
}
