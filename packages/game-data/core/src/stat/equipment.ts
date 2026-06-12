/**
 * 잠재능력을 제외한 장비 옵션의 스탯 구조입니다.
 *
 * 기본 옵션, 추가 옵션, 주문서, 스타포스, 익셉셔널 옵션과
 * 이들을 합산한 종합 옵션에 공통으로 사용합니다.
 */
export interface EquipmentStatOption {
  /** 힘 */
  str: number;
  /** 민첩 */
  dex: number;
  /** 지력 */
  int: number;
  /** 행운 */
  luk: number;
  /** HP */
  maxHp: number;
  /** MP */
  maxMp: number;
  /** HP (%) */
  maxHpRate: number;
  /** MP (%) */
  maxMpRate: number;
  /** 공격력 */
  attackPower: number;
  /** 마력 */
  magicPower: number;
  /** 방어력 */
  armor: number;
  /** 이동속도 */
  speed: number;
  /** 점프력 */
  jump: number;
  /** 보스 몬스터 데미지 (%) */
  bossDamage: number;
  /** 몬스터 방어율 무시 (%) */
  ignoreMonsterArmor: number;
  /** 올스탯 (%) */
  allStat: number;
  /** 데미지 (%) */
  damage: number;
  /** 장착 장비 레벨 감소 */
  equipmentLevelDecrease: number;
}
