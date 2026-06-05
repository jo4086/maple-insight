import type { EquipmentSet, EquipmentType } from '@/types';

type EquipmentSetType = EquipmentType | 'weapon';

type EquipmentSetPart = {
  part: EquipmentSetType;
  count?: number;
};

export const equipmentSetMetaMap = {
  cygnusEmpress: 140,
  rootAbyss: 150,
  absolabs: 160,
  challenger: 200,
  arcaneShade: 200,
  eternal: 250,

  brilliantBoss: 250,
  meister: 140,
} as const satisfies Partial<Record<EquipmentSet, number>>;

export const equipmentSetPartMap = {
  cygnusEmpress: [
    // 시그너스 여제
    { part: 'hat' },
    { part: 'cape' },
    { part: 'gloves' },
    { part: 'overall' },
    { part: 'shoes' },
    { part: 'shoulder' },
    { part: 'weapon' },
  ],
  rootAbyss: [
    // 루타비스
    { part: 'hat' },
    { part: 'top' },
    { part: 'bottom' },
    { part: 'weapon' },
  ],
  absolabs: [
    // 앱솔랩스
    { part: 'hat' },
    { part: 'overall' },
    { part: 'gloves' },
    { part: 'shoes' },
    { part: 'cape' },
    { part: 'shoulder' },
    { part: 'weapon' },
  ],
  challenger: [
    // 도전자의 장비
    { part: 'hat' },
    { part: 'top' },
    { part: 'bottom' },
    { part: 'shoes' },
    { part: 'gloves' },
    { part: 'cape' },
    { part: 'shoulder' },
    { part: 'weapon' },
  ],
  arcaneShade: [
    // 아케인셰이드
    { part: 'hat' },
    { part: 'overall' },
    { part: 'gloves' },
    { part: 'shoes' },
    { part: 'cape' },
    { part: 'shoulder' },
    { part: 'weapon' },
  ],
  eternal: [
    // 에테르넬
    { part: 'hat' },
    { part: 'top' },
    { part: 'bottom' },
    { part: 'gloves' },
    { part: 'shoes' },
    { part: 'cape' },
    { part: 'shoulder' },
    { part: 'weapon' },
  ],

  bossAccessory: [
    // 보스 장신구
    { part: 'face' },
    { part: 'eye', count: 3 },
    { part: 'earring', count: 2 },
    { part: 'ring', count: 3 },
    { part: 'pendant', count: 4 },
    { part: 'belt', count: 2 },
    { part: 'shoulder' },
    { part: 'pocket', count: 2 },
    { part: 'badge' },
  ],
  dawnBoss: [
    // 여명의 보스
    { part: 'face' },
    { part: 'ring' },
    { part: 'pendant' },
    { part: 'earring' },
  ],
  darkBoss: [
    // 칠흑의 보스
    { part: 'face' },
    { part: 'eye' },
    { part: 'androidHeart', count: 2 },
    { part: 'belt' },
    { part: 'pendant' },
    { part: 'badge' },
    { part: 'earring' },
    { part: 'ring' },
    { part: 'pocket' },
    { part: 'emblem' },
  ],
  brilliantBoss: [
    // 광휘의 보스
    { part: 'ring', count: 2 },
    { part: 'pendant' },
    { part: 'medal' },
    { part: 'face' },
  ],
  meister: [{ part: 'ring' }, { part: 'pendant' }, { part: 'shoulder' }, { part: 'weapon' }],

  sevenDay: [{ part: 'badge' }, { part: 'medal' }],
} as const satisfies Record<EquipmentSet, readonly EquipmentSetPart[]>;
