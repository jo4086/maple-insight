import type { HeroSkillName } from './skillName';

import { ascentSkillCommonStats, originSkillCommonStats } from '@/skill/common';
import { skillFormula, type SkillStatTable } from '@/skill/types';

export const heroSkillStat = {
  '아이언 바디': [
    {
      stat: 'armor',
      amount: skillFormula.level(10),
    },
    {
      stat: 'maxHpRate',
      amount: skillFormula.level(1),
    },
  ],
  '워리어 마스터리': [
    {
      stat: 'speed',
      amount: skillFormula.level(1, { base: 2 }),
    },
    {
      stat: 'jump',
      amount: skillFormula.floorLevelInterval(2),
    },
    {
      stat: 'maxHp',
      amount: skillFormula.level(20),
    },
    {
      stat: 'stance',
      amount: skillFormula.level(2),
    },
  ],
  '콤보 어택': [
    {
      isActive: true,
      stat: 'attackPower',
      amount: 2,
      stack: {
        max: 5,
      },
      stacking: 'overwrite',
    },
  ],
  '스피릿 블레이드': [
    {
      isActive: true,
      stat: 'attackPower',
      amount: skillFormula.level(1, { base: 10 }),
    },
  ],
  '웨폰 마스터리': [
    {
      stat: 'weaponMastery',
      amount: skillFormula.level(4, { base: 10 }),
      stacking: 'overwrite',
    },
    {
      stat: 'finalDamage',
      amount: 'level',
    },
    {
      stat: 'criticalRate',
      amount: skillFormula.level(1, { base: 5 }),
    },
    {
      stat: 'attackSpeed',
      amount: 1,
    },
    {
      stat: 'damage',
      amount: 5,
      condition: {
        weaponType: ['도끼'],
      },
    },
  ],
  '웨폰 액셀레이션': [
    {
      stat: 'attackSpeed',
      amount: 2,
    },
    {
      stat: 'str',
      amount: skillFormula.level(2),
    },
  ],
  '피지컬 트레이닝': [
    {
      stat: 'str',
      amount: skillFormula.level(6),
    },
    {
      stat: 'dex',
      amount: skillFormula.level(6),
    },
  ],
  '콤보 시너지': [
    {
      stat: 'finalDamage',
      amount: skillFormula.ceilLevelInterval(4),
      stack: {
        sourceSkill: '콤보 어택',
      },
    },
  ],
  '찬스 어택': [
    {
      stat: 'finalDamage',
      amount: skillFormula.level(2, { base: 5 }),
      condition: {
        targetStatus: ['자상', '행동 불가'],
      },
    },
    {
      stat: 'criticalRate',
      amount: skillFormula.level(2),
    },
  ],
  인듀어: [
    {
      stat: 'statusResistance',
      amount: skillFormula.level(1, { base: 16 }),
    },
    {
      stat: 'elementalResistanceRate',
      amount: skillFormula.level(1, { base: 16 }),
    },
  ],
  인레이지: [
    {
      stat: 'finalDamage',
      amount: skillFormula.floorLevelInterval(2, { base: 10 }),
    },
    {
      stat: 'criticalDamage',
      amount: skillFormula.floorLevelInterval(3, { base: 10 }),
    },
  ],
  '어드밴스드 콤보': [
    {
      stat: 'weaponMastery',
      amount: skillFormula.floorLevelInterval(2, { base: 55 }),
      stacking: 'overwrite',
    },
  ],
  '컴뱃 마스터리': [
    {
      stat: 'ignoreMonsterArmor',
      amount: skillFormula.level(1, { base: 20 }),
    },
  ],
  스탠스: [
    {
      stat: 'stance',
      amount: skillFormula.level(2),
    },
  ],
  '어드밴스드 파이널 어택': [
    {
      stat: 'attackPower',
      amount: 'level',
    },
  ],
  '어드밴스드 콤보-보스 킬러': [
    {
      stat: 'bossDamage',
      amount: 2,
      stack: {
        sourceSkill: '콤보 어택',
      },
    },
  ],
  발할라: [
    {
      isActive: true,
      stat: 'attackPower',
      amount: 50,
    },
    {
      isActive: true,
      stat: 'criticalRate',
      amount: 30,
    },
    {
      isActive: true,
      stat: 'statusResistance',
      amount: 100,
    },
    {
      isActive: true,
      stat: 'elementalResistanceRate',
      amount: 100,
    },
  ],
  '에픽 어드벤쳐': [
    {
      isActive: true,
      stat: 'damage',
      amount: 10,
      condition: {
        characterAffiliation: ['adventurer'],
      },
    },
  ],
  '소드 오브 버닝 소울': [
    {
      isActive: true,
      stat: 'criticalRate',
      amount: 50,
    },
  ],
  '소드 일루전': [
    {
      isActive: true,
      stat: 'finalDamage',
      amount: 12,
      stack: {
        sourceSkill: '콤보 어택',
        max: 6,
      },
    },
  ],
  '스피릿 칼리버': originSkillCommonStats,
  '사일런트 클리브': ascentSkillCommonStats,
} as const satisfies SkillStatTable<HeroSkillName>;
