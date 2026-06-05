import type { ClassGroupSkillName } from './skillName';

import { skillFormula, type SkillStatTable } from '@/skill/types';

export const classGroupSkillStat = {
  '바디 오브 스틸': [
    {
      stat: 'str',
      amount: 'level',
    },
    {
      stat: 'maxHp',
      amount: skillFormula.level(50),
    },
    {
      isActive: true,
      stat: 'statusResistance',
      amount: skillFormula.level(1, { base: 50 }),
    },
    {
      isActive: true,
      stat: 'stance',
      amount: 100,
    },
  ],
  '오라 웨폰': [
    {
      isActive: true,
      stat: 'ignoreMonsterArmor',
      amount: skillFormula.floorLevelInterval(5, { base: 10 }),
    },
    {
      isActive: true,
      stat: 'finalDamage',
      amount: skillFormula.ceilLevelInterval(5),
    },
  ],
  '오버로드 마나': [
    {
      isActive: true,
      stat: 'finalDamage',
      amount: skillFormula.floorLevelInterval(10, { base: 5 }),
    },
  ],
  '레디 투 다이': [
    {
      isActive: true,
      stat: 'finalDamage',
      amount: skillFormula.floorLevelInterval(5, { base: 18 }),
    },
    {
      stat: 'attackPower',
      amount: 'level',
    },
  ],
  '오버 드라이브': [
    {
      isActive: true,
      stat: 'weaponPureAttackPowerRate',
      amount: skillFormula.level(2, { base: 20 }),
    },
    {
      isActive: true,
      phase: 'penalty',
      stat: 'weaponPureAttackPowerRate',
      amount: -15,
    },
  ],
  '로디드 다이스': [
    {
      stat: 'attackPower',
      amount: skillFormula.level(1, { base: 10 }),
    },
  ],
  '럭키 다이스': [
    {
      isActive: true,
      variant: 'dice2',
      stat: 'armorRate',
      amount: 30,
    },
    {
      isActive: true,
      variant: 'dice3',
      stat: 'attackPower',
      amount: 15,
    },
    {
      isActive: true,
      variant: 'dice4',
      stat: 'criticalRate',
      amount: 15,
    },
    {
      isActive: true,
      variant: 'dice5',
      stat: 'damage',
      amount: 20,
    },
    {
      isActive: true,
      variant: 'dice6',
      stat: 'expRate',
      amount: 30,
    },
  ],
  '크리티컬 리인포스': [
    {
      isActive: true,
      stat: 'criticalDamage',
      basedOn: 'criticalRate',
      amount: skillFormula.level(1, { base: 20 }),
    },
  ],
} as const satisfies SkillStatTable<ClassGroupSkillName>;
