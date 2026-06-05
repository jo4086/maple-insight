import type { EquipmentOption } from '@maple/contracts';

export type ItemOptionKey = keyof EquipmentOption;

export type ScrollInfo = {
  scrollUpgrade?: number;
  scrollFlag?: boolean;
  scrollUpgradeableCount?: number;
  scrollResilienceCount?: number;
  scrollCount?: number;
};

export type TestInfoKey = ItemOptionKey & ScrollInfo;

export const optionLabelMap: Record<ItemOptionKey, string> = {
  str: 'STR',
  dex: 'DEX',
  int: 'INT',
  luk: 'LUK',
  allStat: '올스탯',
  maxHp: '최대 HP',
  maxMp: '최대 MP',
  maxHpRate: '최대 HP%',
  maxMpRate: '최대 MP%',
  attackPower: '공격력',
  magicPower: '마력',
  armor: '방어력',
  speed: '이동속도',
  jump: '점프력',
  damage: '데미지',
  bossDamage: '보스 몬스터 데미지',
  ignoreMonsterArmor: '몬스터 방어율 무시',
  equipmentLevelDecrease: '착용 레벨 감소',
};

export const optionOrder: ItemOptionKey[] = [
  'str',
  'dex',
  'int',
  'luk',
  'allStat',
  'maxHp',
  'maxMp',
  'maxHpRate',
  'maxMpRate',
  'attackPower',
  'magicPower',
  'armor',
  'speed',
  'jump',
  'damage',
  'bossDamage',
  'ignoreMonsterArmor',
  // 'equipmentLevelDecrease' : 제외값
];

export const percentKeys: (keyof EquipmentOption)[] = ['allStat', 'maxHpRate', 'maxMpRate', 'damage', 'bossDamage', 'ignoreMonsterArmor'];
