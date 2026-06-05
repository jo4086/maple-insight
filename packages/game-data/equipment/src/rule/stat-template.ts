import { classGroupStatMetaMap } from '@maple/data-core';
import type { ClassGroup, Stat } from '@maple/data-core';

import type { EquipmentCapabilityOverride } from './capability';

import type { EquipmentCategoryLabel, EquipmentTypeLabel, WeaponHandTypeLabel, EquipmentSetLabel } from '@/label';
import type { EquipmentType, EquipmentRequiredClass, EquipmentSet } from '@/types';

export type EquipmentBasicStatKey = 'str' | 'dex' | 'int' | 'luk';

export type EquipmentResolvedBasicStats = Record<EquipmentBasicStatKey, number>;

type EquipmentConvertibleStat = Extract<Stat, 'STR' | 'DEX' | 'INT' | 'LUK'>;

function toEquipmentBasicStatKey(stat: EquipmentConvertibleStat): EquipmentBasicStatKey {
  return stat.toLowerCase() as EquipmentBasicStatKey;
}

function isEquipmentConvertibleStat(stat: Stat): stat is EquipmentConvertibleStat {
  return stat === 'STR' || stat === 'DEX' || stat === 'INT' || stat === 'LUK';
}

export type EquipmentGenerationStatTemplate = {
  /** 방어구 조합형: 직업군 기준 메인/서브 스탯에 같은 값 적용 */
  stat?: number;

  /** STR/DEX/INT/LUK 전체에 같은 값 적용 */
  all?: number;

  /** 개별 스탯 직접 지정 */
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;

  attackPower?: number;
  magicPower?: number;
  maxHp?: number;
  maxHpRate?: number;
  maxMp?: number;
  maxMpRate?: number;
  /** 최대 DF */
  maxDf?: number;
  armor?: number;
  ignoreMonsterArmor?: number;
  bossDamage?: number;

  criRate?: number;
  criDamage?: number;
  normalDamage?: number;

  jump?: number;
  speed?: number;

  finalDamage?: number;

  starforce?: number;
  arc?: number;

  /** attackPower 값을 공격력/마력 둘 다 생성 */
  isOppositeAttack?: boolean;
  /** 기본값은 7로 */
  scrollCount?: number;
  /** 기본값은 0으로 */
  exceptionalScroll?: number;
  /** 기본값은 0으로 */
  specialRingLevel?: number;
  /** 장비별 강화/옵션 시스템 가능 여부 override */
  capability?: EquipmentCapabilityOverride;
};

/** capability를 분리해서 입력할 때 사용하는 순수 스탯 템플릿 */
export type EquipmentGenerationStatInput = Omit<EquipmentGenerationStatTemplate, 'capability'>;

export type ResolveEquipmentBasicStatsInput = {
  /** 입력용 장비 스탯 템플릿 */
  statTemplate: EquipmentGenerationStatTemplate;
  /** `stat` 값을 어느 직업군의 메인/서브 스탯에 적용할지 결정한다. */
  classGroup?: ClassGroup;
};

/**
 * 입력용 스탯 템플릿의 기본 4스탯을 실제 STR/DEX/INT/LUK 값으로 변환한다.
 *
 * 적용 우선순위:
 *  1. `all`: STR/DEX/INT/LUK 전체에 먼저 적용
 *  2. `stat`: 직업군 기준 메인/서브 스탯에 적용
 *  3. `str`/`dex`/`int`/`luk`: 직접 기입된 개별 스탯으로 최종 덮어쓰기
 */
export function resolveEquipmentBasicStats({ statTemplate, classGroup }: ResolveEquipmentBasicStatsInput): EquipmentResolvedBasicStats {
  const stats: EquipmentResolvedBasicStats = {
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
  };

  if (statTemplate.all !== undefined) {
    stats.str = statTemplate.all;
    stats.dex = statTemplate.all;
    stats.int = statTemplate.all;
    stats.luk = statTemplate.all;
  }

  if (statTemplate.stat !== undefined) {
    if (!classGroup) {
      throw new Error('classGroup is required when EquipmentGenerationStatTemplate.stat is used');
    }

    const { mainStat, subStat } = classGroupStatMetaMap[classGroup];

    if (!isEquipmentConvertibleStat(mainStat) || !isEquipmentConvertibleStat(subStat)) {
      throw new Error(`Unsupported classGroup stat meta: ${classGroup}`);
    }

    stats[toEquipmentBasicStatKey(mainStat)] = statTemplate.stat;
    stats[toEquipmentBasicStatKey(subStat)] = statTemplate.stat;
  }

  if (statTemplate.str !== undefined) {
    stats.str = statTemplate.str;
  }

  if (statTemplate.dex !== undefined) {
    stats.dex = statTemplate.dex;
  }

  if (statTemplate.int !== undefined) {
    stats.int = statTemplate.int;
  }

  if (statTemplate.luk !== undefined) {
    stats.luk = statTemplate.luk;
  }

  return stats;
}

export type EquipmentGeneratedNameTemplate = {
  type: 'generatedName';
  requiredLevel?: number;
  requiredClasses?: readonly EquipmentRequiredClass[];
  stats: EquipmentGenerationStatTemplate;
};

export type NamedEquipmentItemBase = {
  name: string;
  /** 입력 데이터에서는 장비 파츠 key를 사용한다. */
  part: EquipmentType;
  setKey: EquipmentSet | null;
  requiredLevel: number;
  requiredClasses: readonly EquipmentRequiredClass[];
};

export interface EquipmentNamedItemTemplate extends NamedEquipmentItemBase {
  type: 'namedItem';
  stats: EquipmentGenerationStatTemplate;
}

export type EquipmentGenerationTemplate = EquipmentGeneratedNameTemplate | EquipmentNamedItemTemplate;

export type GeneratedEquipmentItem = {
  name: string;

  requiredLevel: number;
  requiredClasses: readonly EquipmentRequiredClass[];

  /** 출력본에서는 장비 파츠 한글명을 사용한다. */
  part: EquipmentTypeLabel;

  /** 출력본에서는 장비 세트 한글명을 사용한다. */
  setName: EquipmentSetLabel | null;

  /** 출력본에서는 장비 대분류 한글명을 사용한다. */
  category: EquipmentCategoryLabel | null;

  /** 출력본에서는 한손/두손 한글명을 사용한다. */
  handType: WeaponHandTypeLabel | null;

  str: number;
  dex: number;
  int: number;
  luk: number;

  maxHp: number;
  maxMp: number;
  maxHpRate: number;
  maxMpRate: number;
  maxDf: number;

  attackPower: number;
  magicPower: number;

  armor: number;

  jump: number;
  speed: number;
};
