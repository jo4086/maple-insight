import type { NormalSetName, PrefixSetName } from './name';

import { EquipmentGenerationStatInput } from '@/rule';

type EquipmentSetEffect = {
  count: number;
  stats: EquipmentGenerationStatInput;
};

export const equipmentSetEffectMap = {
  '시그너스 여제 세트': [
    {
      count: 2,
      stats: {
        armor: 300,
      },
    },
    {
      count: 3,
      stats: {
        maxHpRate: 15,
        maxMpRate: 15,
      },
    },
    {
      count: 4,
      stats: {
        attackPower: 15,
        // 상태 이상 내성 10
      },
    },
    {
      count: 5,
      stats: {
        all: 25,
      },
    },
    {
      count: 6,
      stats: {
        attackPower: 30,
        bossDamage: 30,
      },
    },
    {
      count: 7,
      stats: {
        maxHpRate: 15,
        maxMpRate: 15,
        attackPower: 10,
      },
    },
  ],
  '루타비스 세트': [
    {
      count: 2,
      stats: {
        stat: 20,
        maxHp: 1000,
        maxMp: 1000,
      },
    },
    {
      count: 3,
      stats: {
        maxHpRate: 10,
        maxMpRate: 10,
        attackPower: 50,
      },
    },
    {
      count: 4,
      stats: {
        bossDamage: 30,
      },
    },
  ],
  '앱솔랩스 세트': [
    {
      count: 2,
      stats: {
        maxHp: 1500,
        maxMp: 1500,
        attackPower: 20,
        isOppositeAttack: true,
        bossDamage: 10,
      },
    },
    {
      count: 3,
      stats: {
        all: 30,
        attackPower: 20,
        isOppositeAttack: true,
        bossDamage: 10,
      },
    },
    {
      count: 4,
      stats: {
        attackPower: 25,
        isOppositeAttack: true,
        armor: 200,
        ignoreMonsterArmor: 10,
      },
    },
    {
      count: 5,
      stats: {
        attackPower: 30,
        isOppositeAttack: true,
        bossDamage: 10,
      },
    },
    {
      count: 6,
      stats: {
        maxHpRate: 20,
        maxMpRate: 20,
        attackPower: 20,
        isOppositeAttack: true,
      },
    },
    {
      count: 7,
      stats: {
        attackPower: 20,
        isOppositeAttack: true,
        ignoreMonsterArmor: 10,
      },
    },
  ],
  '아케인셰이드 세트': [
    {
      count: 2,
      stats: {
        attackPower: 30,
        isOppositeAttack: true,
        bossDamage: 10,
      },
    },
    {
      count: 3,
      stats: {
        attackPower: 30,
        isOppositeAttack: true,
        armor: 400,
        ignoreMonsterArmor: 10,
      },
    },
    {
      count: 4,
      stats: {
        all: 50,
        attackPower: 35,
        isOppositeAttack: true,
        bossDamage: 10,
      },
    },
    {
      count: 5,
      stats: {
        maxHp: 2000,
        maxMp: 2000,
        attackPower: 40,
        isOppositeAttack: true,
        bossDamage: 10,
      },
    },
    {
      count: 6,
      stats: {
        maxHpRate: 30,
        maxMpRate: 30,
        attackPower: 30,
        isOppositeAttack: true,
      },
    },
    {
      count: 7,
      stats: {
        attackPower: 30,
        isOppositeAttack: true,
        ignoreMonsterArmor: 10,
      },
    },
  ],
  '에테르넬 세트': [
    {
      count: 2,
      stats: {
        maxHp: 2500,
        maxMp: 2500,
        attackPower: 40,
        isOppositeAttack: true,
        bossDamage: 10,
      },
    },
    {
      count: 3,
      stats: {
        all: 50,
        attackPower: 40,
        isOppositeAttack: true,
        armor: 600,
        bossDamage: 10,
      },
    },
    {
      count: 4,
      stats: {
        maxHpRate: 15,
        maxMpRate: 15,
        attackPower: 40,
        isOppositeAttack: true,
        bossDamage: 10,
      },
    },
    {
      count: 5,
      stats: {
        attackPower: 40,
        isOppositeAttack: true,
        ignoreMonsterArmor: 20,
      },
    },
    {
      count: 6,
      stats: {
        attackPower: 40,
        isOppositeAttack: true,
        bossDamage: 15,
      },
    },
    {
      count: 7,
      stats: {
        all: 50,
        maxHp: 2500,
        maxMp: 2500,
        attackPower: 40,
        isOppositeAttack: true,
        bossDamage: 15,
      },
    },
    {
      count: 8,
      stats: {
        attackPower: 40,
        isOppositeAttack: true,
        bossDamage: 15,
      },
    },
  ],
} as const satisfies Record<PrefixSetName, EquipmentSetEffect[]>;

function createBaseStats(constant: number): { all: number; maxHp: number; attackPower: number; isOppositeAttack: boolean } {
  return {
    all: 5 * (constant + 1),
    maxHp: 125 * (constant + 1),
    attackPower: 5 * (constant + 1),
    isOppositeAttack: true,
  };
}

export const normalSetEffectMap = {
  '보스 장신구 세트': [
    {
      count: 3,
      stats: {
        all: 10,
        maxHpRate: 5,
        maxMpRate: 5,
        attackPower: 5,
        isOppositeAttack: true,
      },
    },
    {
      count: 5,
      stats: {
        all: 10,
        maxHpRate: 5,
        maxMpRate: 5,
        attackPower: 5,
        isOppositeAttack: true,
      },
    },
    {
      count: 7,
      stats: {
        all: 10,
        attackPower: 10,
        isOppositeAttack: true,
        armor: 80,
        ignoreMonsterArmor: 10,
      },
    },
    {
      count: 9,
      stats: {
        all: 15,
        attackPower: 10,
        isOppositeAttack: true,
        armor: 100,
        bossDamage: 10,
      },
    },
  ],
  '여명의 보스 세트': [
    {
      count: 2,
      stats: {
        all: 10,
        maxHp: 250,
        attackPower: 10,
        isOppositeAttack: true,
        bossDamage: 10,
      },
    },
    {
      count: 3,
      stats: {
        all: 10,
        maxHp: 250,
        attackPower: 10,
        isOppositeAttack: true,
      },
    },
    {
      count: 4,
      stats: {
        all: 10,
        maxHp: 250,
        attackPower: 10,
        isOppositeAttack: true,
        armor: 100,
        ignoreMonsterArmor: 10,
      },
    },
  ],
  '칠흑의 보스 세트': [
    {
      count: 2,
      stats: {
        ...createBaseStats(1),
        bossDamage: 10,
      },
    },
    {
      count: 3,
      stats: {
        ...createBaseStats(1),
        armor: 250,
        ignoreMonsterArmor: 10,
      },
    },
    {
      count: 4,
      stats: {
        ...createBaseStats(2),
        criDamage: 5,
      },
    },
    {
      count: 5,
      stats: {
        ...createBaseStats(2),
        bossDamage: 10,
      },
    },
    {
      count: 6,
      stats: {
        ...createBaseStats(2),
        ignoreMonsterArmor: 10,
      },
    },
    {
      count: 7,
      stats: {
        ...createBaseStats(2),
        criDamage: 5,
      },
    },
    {
      count: 8,
      stats: {
        ...createBaseStats(2),
        bossDamage: 10,
      },
    },
    {
      count: 9,
      stats: {
        ...createBaseStats(2),
        criDamage: 5,
      },
    },
    {
      count: 10,
      stats: {
        ...createBaseStats(3),
        bossDamage: 10,
      },
    },
  ],
  '광휘의 보스 세트': [
    {
      count: 2,
      stats: {
        ...createBaseStats(4),
        bossDamage: 15,
      },
    },
    {
      count: 3,
      stats: {
        ...createBaseStats(4),
        ignoreMonsterArmor: 15,
      },
    },
    {
      count: 4,
      stats: {
        ...createBaseStats(4),
        criDamage: 5,
      },
    },
    {
      count: 5,
      stats: {
        ...createBaseStats(4),
        bossDamage: 15,
      },
    },
  ],
  '마이스터 세트': [
    {
      count: 2,
      stats: {
        maxHpRate: 10,
        maxMpRate: 10,
      },
    },
    {
      count: 3,
      stats: {
        attackPower: 40,
        isOppositeAttack: true,
      },
    },
    {
      count: 4,
      stats: {
        bossDamage: 20,
      },
    },
  ],
  '칠요 세트': [
    {
      count: 2,
      stats: {
        ignoreMonsterArmor: 10,
      },
    },
  ],
} as const satisfies Record<NormalSetName, readonly EquipmentSetEffect[]>;
