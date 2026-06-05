import type { EquipmentType } from '@/types';

export type ScrollUpgradeRuleEquipmentType = EquipmentType | 'subWeapon';

/**
 * 기본적으로 주문서 강화가 불가능한 장비 파츠다.
 *
 * 기계심장(`androidHeart`)은 안드로이드와 별개 장비로 주문서 강화가 가능하므로
 * `android`만 비활성 파츠에 포함한다.
 */
export const scrollUpgradeDisabledEquipmentTypes = [
  'title',
  'medal',
  'subWeapon',
  'pocket',
  'badge',
  'emblem',
  'android',
] as const satisfies readonly ScrollUpgradeRuleEquipmentType[];

/** 아이템 이름이 정확히 일치하면 주문서 강화가 불가능한 아이템 예외다. */
export const scrollUpgradeDisabledItemNames = [
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

type ScrollUpgradeEquipmentRuleInput = {
  /** 장비 파츠 key */
  type: ScrollUpgradeRuleEquipmentType;
  /** 아이템 이름 */
  name: string;
};

export function isScrollUpgradeEnabledByEquipmentRule({ type, name }: ScrollUpgradeEquipmentRuleInput) {
  const disabledTypes: readonly ScrollUpgradeRuleEquipmentType[] = scrollUpgradeDisabledEquipmentTypes;

  if ((scrollUpgradeDisabledItemNames as readonly string[]).includes(name)) {
    return false;
  }

  return !disabledTypes.includes(type);
}
