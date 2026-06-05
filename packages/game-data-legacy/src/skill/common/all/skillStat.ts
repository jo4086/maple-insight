import type { AllSkillName } from './skillName';

import { skillFormula, type SkillStatFormula, type SkillStatTable } from '@/skill/types';

export const allSkillStat = {
  '연합의 의지': [
    {
      stat: 'allStat',
      amount: 5,
    },
    {
      stat: 'attackPower',
      amount: 5,
    },
    {
      stat: 'magicPower',
      amount: 5,
    },
  ],
  '정령의 축복': [
    {
      stat: 'attackPower',
      amount: 'level',
    },
    {
      stat: 'magicPower',
      amount: 'level',
    },
  ],
  '여제의 축복': [
    {
      stat: 'attackPower',
      amount: 'level',
    },
    {
      stat: 'magicPower',
      amount: 'level',
    },
  ],
  블링크: [
    {
      stat: 'attackPower',
      amount: 'level',
    },
    {
      stat: 'magicPower',
      amount: 'level',
    },
  ],
  '로프 커넥트': [
    {
      stat: 'allStat',
      amount: 'level',
    },
  ],
  '쓸만한 미스틱 도어': [
    {
      stat: 'allStat',
      amount: skillFormula.ceilLevelInterval(5),
    },
  ],
  '쓸만한 샤프 아이즈': [
    {
      stat: 'allStat',
      amount: skillFormula.ceilLevelInterval(5),
    },
  ],
  '쓸만한 어드밴스드 블레스': [
    {
      stat: 'allStat',
      amount: skillFormula.ceilLevelInterval(5),
    },
  ],
  '쓸만한 홀리 파운틴': [
    {
      stat: 'allStat',
      amount: skillFormula.ceilLevelInterval(5),
    },
  ],
  '쓸만한 하이퍼 바디': [
    {
      stat: 'allStat',
      amount: skillFormula.ceilLevelInterval(5),
    },
  ],
  '쓸만한 컴뱃 오더스': [
    {
      stat: 'statusResistance',
      amount: skillFormula.ceilLevelInterval(5),
    },
  ],
  '쓸만한 윈드 부스터': [
    {
      stat: 'allStat',
      amount: skillFormula.ceilLevelInterval(5),
    },
  ],
  '솔 야누스': [
    {
      stat: 'expRate',
      amount: {
        type: 'logLevelBonus',
        base: 8,
        perLevel: 2,
        bonuses: [
          { logBase: 10, amount: 9 },
          { logBase: 20, amount: 10 },
          { logBase: 30, amount: 13 },
        ],
      },
    },
  ],
} as const satisfies SkillStatTable<AllSkillName>;

export const originSkillCommonStats = [
  {
    stat: 'ignoreMonsterArmor',
    amount: {
      type: 'piecewise',
      ranges: [
        { minLevel: 1, maxLevel: 9, formula: { type: 'fixed', value: 0 } },
        { minLevel: 10, maxLevel: 29, formula: { type: 'fixed', value: 20 } },
        { minLevel: 30, formula: { type: 'fixed', value: 30 } },
      ],
    },
  },
  {
    stat: 'bossDamage',
    amount: {
      type: 'piecewise',
      ranges: [
        { minLevel: 1, maxLevel: 19, formula: { type: 'fixed', value: 0 } },
        { minLevel: 20, maxLevel: 29, formula: { type: 'fixed', value: 20 } },
        { minLevel: 30, formula: { type: 'fixed', value: 30 } },
      ],
    },
  },
] as const satisfies readonly SkillStatFormula[];

export const ascentSkillCommonStats = [
  {
    stat: 'ignoreMonsterArmor',
    amount: {
      type: 'piecewise',
      ranges: [
        { minLevel: 1, maxLevel: 9, formula: { type: 'fixed', value: 60 } },
        { minLevel: 10, maxLevel: 19, formula: { type: 'fixed', value: 70 } },
        { minLevel: 20, maxLevel: 29, formula: { type: 'fixed', value: 80 } },
        { minLevel: 30, formula: { type: 'fixed', value: 100 } },
      ],
    },
  },
  {
    stat: 'bossDamage',
    amount: {
      type: 'piecewise',
      ranges: [
        { minLevel: 1, maxLevel: 9, formula: { type: 'fixed', value: 40 } },
        { minLevel: 10, maxLevel: 19, formula: { type: 'fixed', value: 50 } },
        { minLevel: 20, formula: { type: 'fixed', value: 60 } },
      ],
    },
  },
  {
    stat: 'criticalRate',
    amount: 100,
  },
] as const satisfies readonly SkillStatFormula[];

export const solHecateSkillCommonStats = [
  {
    stat: 'ignoreMonsterArmor',
    amount: {
      type: 'piecewise',
      ranges: [
        { minLevel: 1, maxLevel: 9, formula: { type: 'fixed', value: 0 } },
        { minLevel: 10, maxLevel: 19, formula: { type: 'fixed', value: 20 } },
        { minLevel: 20, maxLevel: 30, formula: { type: 'fixed', value: 40 } },
      ],
    },
  },
  {
    stat: 'bossDamage',
    amount: {
      type: 'piecewise',
      ranges: [
        { minLevel: 1, maxLevel: 9, formula: { type: 'fixed', value: 0 } },
        { minLevel: 10, maxLevel: 19, formula: { type: 'fixed', value: 20 } },
        { minLevel: 20, maxLevel: 30, formula: { type: 'fixed', value: 40 } },
      ],
    },
  },
] as const satisfies readonly SkillStatFormula[];
