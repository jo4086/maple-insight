import type { LenSkillName } from './skillName';

import { ascentSkillCommonStats, originSkillCommonStats } from '@/skill/common';
import { skillFormula, type SkillStatTable } from '@/skill/types';

export const lenSkillStat = {
  청풍유심: [
    {
      stat: 'speed',
      amount: 20,
    },
    {
      stat: 'jump',
      amount: 20,
    },
    {
      stat: 'maxSpeed',
      amount: 20,
    },
  ],
  청허심경: [
    {
      stat: 'attackPower',
      amount: 30,
    },
    {
      stat: 'criticalRate',
      amount: {
        type: 'floorLinear',
        base: 5,
        levelInterval: 2,
      },
    },
    {
      stat: 'finalDamage',
      amount: {
        type: 'floorLinear',
        base: 1,
        levelInterval: 5,
      },
    },
  ],
  '매화검 1초식 : 순인': [
    {
      stat: 'maxHpRate',
      amount: 10,
    },
  ],
  '장검 가속': [
    {
      stat: 'attackSpeed',
      amount: 2,
    },
  ],
  '장검 숙련': [
    {
      stat: 'weaponMastery',
      amount: 50,
      stacking: 'overwrite',
    },
    {
      stat: 'attackPower',
      amount: 30,
    },
  ],
  '신체 단련': [
    {
      stat: 'str',
      amount: {
        type: 'linear',
        base: 0,
        perLevel: 15,
      },
    },
  ],
  '청허심경 II': [
    {
      stat: 'criticalRate',
      amount: {
        type: 'linear',
        base: 0,
        perLevel: 2,
      },
    },
    {
      stat: 'finalDamage',
      amount: {
        type: 'ceilLinear',
        base: 5,
        levelInterval: 2,
      },
    },
  ],
  '망혼검 1초식 : 운기': [
    {
      stat: 'statusResistance',
      amount: 100,
    },
  ],
  강신: [
    {
      stat: 'armor',
      amount: 200,
    },
    {
      stat: 'statusResistance',
      amount: 30,
    },
    {
      stat: 'stance',
      amount: 60,
    },
  ],
  '청허심경 III': [
    {
      stat: 'maxHp',
      amount: 'level',
    },
    {
      stat: 'criticalRate',
      amount: skillFormula.floorLevelInterval(4, {
        base: 5,
      }),
    },
    {
      stat: 'finalDamage',
      amount: skillFormula.floorLevelInterval(4, {
        base: 5,
      }),
    },
  ],
  '아니마의 용사': [
    {
      stat: 'apStatRate',
      amount: {
        type: 'floorLinear',
        base: 1,
        perLevel: 0.5,
        levelOffset: 1,
      },
    },
  ],
  '고급 장검 숙련': [
    {
      stat: 'weaponMastery',
      amount: skillFormula.ceilLevelInterval(2, {
        base: 55,
      }),
    },
    {
      stat: 'attackPower',
      amount: skillFormula.ceilLevelInterval(2, {
        base: 3,
        amountPerInterval: 3,
      }),
    },
    {
      stat: 'finalDamage',
      amount: skillFormula.floorLevelInterval(4, { base: 4 }),
    },
  ],
  '청허심경 IV': [
    {
      stat: 'attackPower',
      amount: skillFormula.ceilLevelInterval(3, {
        base: 17,
        amountPerInterval: 4,
      }),
    },
    {
      stat: 'finalDamage',
      amount: skillFormula.ceilLevelInterval(2, { base: 5 }),
    },
  ],
  진안: [
    {
      stat: 'damage',
      amount: skillFormula.ceilLevelInterval(2, { base: 5 }),
    },
    {
      stat: 'criticalDamage',
      amount: skillFormula.ceilLevelInterval(4, { base: 5 }),
    },
    {
      stat: 'ignoreMonsterArmor',
      amount: skillFormula.level(2),
    },
  ],
  '창룡파천검 : 승천': originSkillCommonStats,
  '창룡파천검 : 일매낙화 천비인적': ascentSkillCommonStats,
} as const satisfies SkillStatTable<LenSkillName>;
