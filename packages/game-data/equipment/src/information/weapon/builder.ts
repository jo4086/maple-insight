import type { EquipmentCapabilityOverride, EquipmentGenerationStatInput, EquipmentGenerationStatTemplate } from '@/rule';
import { resolveWeaponRequiredClass, weaponTypeMetaMap } from '@/rule/weapon';
import type { EquipmentRequiredClass, EquipmentSet, WeaponHandType, WeaponType } from '@/types';

/**
 * src/information/weapon/builder.ts
 *
 * 무기 이름을 key로 하는 데이터 맵을 만들기 위한 builder 모음.
 *
 * @function createWeaponMetaBuilder - 무기 이름 -> 무기 메타 맵 생성
 * @function createWeaponStatBuilder - 무기 이름 -> 무기 스탯 맵 생성
 *
 * @type {WeaponMeta} - 생성된 무기 메타 값
 * @type {WeaponMetaInput} - 무기 메타 작성 시 직접 입력 가능한 값
 * @type {WeaponMetaBuilder} - 무기 메타 맵 builder
 * @type {WeaponStatBuilder} - 무기 스탯 맵 builder
 */

/** 무기 메타 맵의 값 타입 */
type WeaponMeta<TWeaponType extends WeaponType = WeaponType> = {
  /** 장비 대분류 */
  category: 'weapon';
  /** 한손/두손 여부 */
  handType: WeaponHandType;
  /** 실제 장비 파츠. 무기는 무기 종류가 곧 part */
  part: TWeaponType;
  /** 장비 세트 key */
  setKey: EquipmentSet | null;
  /** 착용 가능 직업/직업군 */
  requiredClass: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  /** 착용 요구 레벨 */
  requiredLevel: number;
  /** 럭키 아이템 여부 */
  luckyFlag: boolean;
  /** 장착 시 부여되는 장비 전용 스킬명 */
  grantedSkills: readonly string[];
};

/** 무기 메타 builder 기본 입력값 */
type WeaponMetaBuilderBaseInput = {
  /** 착용 요구 레벨 */
  requiredLevel: number;
  /** 기본 장비 세트 key */
  setKey?: EquipmentSet | null;
  /** 기본 럭키 아이템 여부 */
  luckyFlag?: boolean;
  /** 기본 장착 부여 스킬명 */
  grantedSkills?: readonly string[];
};

/** 무기 메타 작성 시 예외로 직접 override할 수 있는 입력값 */
type WeaponMetaInput = Partial<Pick<WeaponMeta, 'setKey' | 'luckyFlag' | 'grantedSkills'>>;

/** 무기 메타 맵을 단계적으로 작성하는 builder */
type WeaponMetaBuilder<TName extends string, TUsed extends TName> = {
  /** 무기 이름과 무기 종류를 연결한다. 이미 추가한 이름은 다음 add 후보에서 제외된다. */
  add: <const TCurrentName extends Exclude<TName, TUsed>, const TWeaponType extends WeaponType>(
    name: TCurrentName,
    weaponType: TWeaponType,
    meta?: WeaponMetaInput,
  ) => WeaponMetaBuilder<TName, TUsed | TCurrentName>;
  /** 작성 중인 부분 맵을 반환한다. 일부 무기가 누락되어도 허용한다. */
  done: () => Partial<Record<TName, WeaponMeta>>;
  /** 모든 무기 이름이 작성된 경우에만 전체 맵을 반환한다. */
  doneStrict: [Exclude<TName, TUsed>] extends [never] ? () => Record<TName, WeaponMeta> : never;
};

/**
 * INFO: 무기 메타 맵 builder를 생성한다.
 *
 * `requiredLevel`은 같은 세트 무기가 공유하는 요구 레벨이다.
 * `handType`, `requiredClass`는 `weaponType` 기준으로 자동 주입되며,
 * 착용 직업/직업군 규칙은 `rule/weapon/weapon.ts`의 `weaponTypeMetaMap`을 따른다.
 */
export function createWeaponMetaBuilder<TName extends string, TUsed extends TName = never>(
  baseMeta: WeaponMetaBuilderBaseInput,
  map: Partial<Record<TName, WeaponMeta>> = {},
): WeaponMetaBuilder<TName, TUsed> {
  const defaultMeta = {
    setKey: null,
    luckyFlag: false,
    grantedSkills: [],
    ...baseMeta,
  } satisfies Required<WeaponMetaBuilderBaseInput>;

  return {
    add: (name, weaponType, meta = {}) =>
      createWeaponMetaBuilder<TName, TUsed | typeof name>(defaultMeta, {
        ...map,
        [name]: {
          ...meta,
          category: 'weapon',
          part: weaponType,
          setKey: meta.setKey ?? defaultMeta.setKey,
          handType: weaponTypeMetaMap[weaponType].handType,
          requiredClass: resolveWeaponRequiredClass(weaponTypeMetaMap[weaponType]),
          requiredLevel: defaultMeta.requiredLevel,
          luckyFlag: meta.luckyFlag ?? defaultMeta.luckyFlag,
          grantedSkills: meta.grantedSkills ?? defaultMeta.grantedSkills,
        },
      }),
    done: () => map,
    doneStrict: (() => map) as WeaponMetaBuilder<TName, TUsed>['doneStrict'],
  };
}

/** 무기 스탯 맵을 단계적으로 작성하는 builder */
type WeaponStatBuilder<TName extends string, TUsed extends TName> = {
  /** 무기 이름과 스탯 템플릿을 연결한다. 이미 추가한 이름은 다음 add 후보에서 제외된다. */
  add: <const TCurrentName extends Exclude<TName, TUsed>>(
    name: TCurrentName,
    stat?: EquipmentGenerationStatInput,
    capability?: EquipmentCapabilityOverride,
  ) => WeaponStatBuilder<TName, TUsed | TCurrentName>;
  /** 작성 중인 부분 맵을 반환한다. 일부 무기가 누락되어도 허용한다. */
  done: () => Partial<Record<TName, EquipmentGenerationStatTemplate>>;
  /** 모든 무기 이름이 작성된 경우에만 전체 맵을 반환한다. */
  doneStrict: [Exclude<TName, TUsed>] extends [never] ? () => Record<TName, EquipmentGenerationStatTemplate> : never;
};

/**
 * INFO: 무기 스탯 맵 builder를 생성한다.
 *
 * `baseStat`은 같은 세트 무기가 공유하는 공통 스탯이다.
 * `add()`의 stat은 `EquipmentGenerationStatTemplate`을 사용한다.
 * 공격력/마력, 주문서 횟수, 보공/방무 같은 무기별 기본 스탯을 여기에 적는다.
 */
export function createWeaponStatBuilder<TName extends string, TUsed extends TName = never>(
  baseStat: EquipmentGenerationStatInput = {},
  baseCapability: EquipmentCapabilityOverride = {},
  map: Partial<Record<TName, EquipmentGenerationStatTemplate>> = {},
): WeaponStatBuilder<TName, TUsed> {
  return {
    add: (name, stat = {}, capabilityOverride = {}) => {
      const capability = {
        ...baseCapability,
        ...capabilityOverride,
      };

      return createWeaponStatBuilder<TName, TUsed | typeof name>(baseStat, baseCapability, {
        ...map,
        [name]: {
          ...baseStat,
          ...stat,
          ...(Object.keys(capability).length > 0 ? { capability } : {}),
        },
      });
    },
    done: () => map,
    doneStrict: (() => map) as WeaponStatBuilder<TName, TUsed>['doneStrict'],
  };
}
