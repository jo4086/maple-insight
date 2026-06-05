import { dragonTypes, mechanicTypes } from '@/types';
import type { EquipmentType, SubWeaponType } from '@/types';

export type StarforceRuleEquipmentType = EquipmentType | 'subWeapon';

/**
 * 기본적으로 스타포스가 존재하지 않는 장비 파츠다.
 *
 * 보조무기는 대부분 스타포스가 없지만, 방패류와 아스트라 보조무기는 예외적으로
 * 스타포스가 존재하므로 아래 enabled 예외 규칙에서 다시 허용한다.
 */
export const starforceDisabledEquipmentTypes = [
  'title',
  'medal',
  'subWeapon',
  'pocket',
  'badge',
  'emblem',
  'android',
  ...mechanicTypes,
  ...dragonTypes,
] as const satisfies readonly StarforceRuleEquipmentType[];

/** 아이템 이름이 정확히 일치하면 스타포스가 존재하지 않는 아이템 예외다. */
export const starforceDisabledItemNames = [
  '정령의 펜던트',

  // 특수 반지
  '컨티뉴어스 링 Lv.3',
  '컨티뉴어스 링 Lv.4',
  '리스트레인트 링 Lv.3',
  '리스트레인트 링 Lv.4',
  '웨폰퍼프 - S링 Lv.3',
  '웨폰퍼프 - S링 Lv.4',
  '웨폰퍼프 - D링 Lv.3',
  '웨폰퍼프 - D링 Lv.4',
  '웨폰퍼프 - I링 Lv.3',
  '웨폰퍼프 - I링 Lv.4',
  '웨폰퍼프 - L링 Lv.3',
  '웨폰퍼프 - L링 Lv.4',

  // 이벤트 반지
  '벤젼스 링',
  '코스모스 링',
  'SS급 마스터 쥬얼링',
  '결속의 반지',
  '어드벤쳐 딥다크 크리티컬',
  '카오스 링',
  '테네브리스 원정대 반지',
  '글로리온 링 : 가디언',
  '글로리온 링 : 커맨더',
  '글로리온 링 : 마스터',
  '글로리온 링 : 슈프림',
  '어웨이크 링',
  '이터널 플레임 링',
  '어비스 헌터스 링',
] as const;

/** 스타포스가 존재하는 보조무기 타입 예외다. */
export const starforceEnabledSubWeaponTypes = ['shield'] as const satisfies readonly SubWeaponType[];

/** 이름에 해당 문자열이 포함되면 스타포스가 존재하는 아이템 예외다. */
export const starforceEnabledItemNameIncludes = ['아스트라'] as const;

type StarforceEquipmentRuleInput = {
  /** 장비 파츠 key */
  type: StarforceRuleEquipmentType;
  /** 보조무기 세부 타입 key */
  subWeaponType?: SubWeaponType | null;
  /** 아이템 이름 */
  name: string;
};

export function isStarforceEnabledByEquipmentRule({ type, subWeaponType, name }: StarforceEquipmentRuleInput) {
  const disabledTypes: readonly StarforceRuleEquipmentType[] = starforceDisabledEquipmentTypes;
  const enabledSubWeaponTypes: readonly SubWeaponType[] = starforceEnabledSubWeaponTypes;

  if ((starforceDisabledItemNames as readonly string[]).includes(name)) {
    return false;
  }

  if (!disabledTypes.includes(type)) {
    return true;
  }

  if (type !== 'subWeapon') {
    return false;
  }

  return Boolean(
    (subWeaponType && enabledSubWeaponTypes.includes(subWeaponType)) ||
      starforceEnabledItemNameIncludes.some((nameIncludes) => name.includes(nameIncludes)),
  );
}
