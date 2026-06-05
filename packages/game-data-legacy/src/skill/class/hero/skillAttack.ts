import { HeroAttackSkillName } from './skillMeta';

import { SkillAttackTable, skillFormula } from '@/skill/types';

export const heroSkillAttackTable = {
  '슬래시 블러스트': [
    {
      type: 'action',
      maxTargets: 6,
      hitCount: 1,
      repeatCount: 1,
      damagePercent: 335,
    },
  ],
  '리프 어택': [
    {
      type: 'action',
      maxTargets: 4,
      hitCount: 2,
      damagePercent: 90,
    },
  ],
  브랜디쉬: [
    {
      type: 'action',
      maxTargets: 6,
      hitCount: 2,
      damagePercent: skillFormula.level(3, { base: 220 }),
    },
  ],
  '플래시 슬래시': [
    {
      type: 'action',
      maxTargets: 6,
      hitCount: 5,
      damagePercent: skillFormula.level(5, { base: 100 }),
    },
  ],
  '파이널 어택': [
    {
      type: 'nonAction',
      maxTargets: 1,
      hitCount: 1,
      damagePercent: skillFormula.floorLevelInterval(2, {
        base: 100,
        amountPerInterval: 5,
      }),
      trigger: {
        triggerOn: 'directAttackHit',
        chancePercent: skillFormula.level(2),
      },
    },
  ],
  '브레이브 슬래시': [
    {
      type: 'action',
      maxTargets: 6,
      hitCount: 3,
      damagePercent: skillFormula.level(3, { base: 198 }),
    },
  ],
  '오라 블레이드': [
    {
      type: 'action',
      maxTargets: 8,
      hitCount: 5,
      damagePercent: skillFormula.level(4, { base: 180 }),
      stats: [
        {
          stat: 'normalDamage',
          amount: skillFormula.level(4, { base: 100 }),
        },
      ],
    },
  ],
  돌진: [
    {
      type: 'action',
      maxTargets: 12,
      hitCount: 1,
      damagePercent: skillFormula.level(6, { base: 245 }),
    },
  ],
  '레이징 블로우': [
    {
      type: 'action',
      maxTargets: 8,
      hitCount: 4,
      damagePercent: skillFormula.level(4, { base: 200 }),
    },
  ],
  '강화 레이징 블로우': [
    {
      type: 'action',
      maxTargets: 8,
      hitCount: 4,
      damagePercent: skillFormula.level(4, { base: 267 }),
    },
  ],
  인사이징: [
    {
      type: 'action',
      maxTargets: 8,
      hitCount: 4,
      damagePercent: skillFormula.level(3, { base: 310 }),
      stats: [
        {
          stat: 'normalDamage',
          amount: 50,
        },
      ],
    },
  ],
  '어드밴스드 파이널 어택': [
    {
      type: 'nonAction',
      maxTargets: 1,
      hitCount: 3,
      damagePercent: skillFormula.level(2, { base: 110 }),
      trigger: {
        triggerOn: 'directAttackHit',
        chancePercent: skillFormula.ceilLevelInterval(2, { base: 45 }),
      },
    },
  ],
  발할라: [
    {
      type: 'nonAction',
      maxTargets: 6,
      hitCount: 2,
      repeatCount: 3,
      damagePercent: 520,
      intervalSec: 120,
      cycleCount: 12,
      trigger: {
        triggerOn: 'skillUse',
        tags: ['검술'],
      },
    },
  ],
  '레이지 업라이징': [
    {
      type: 'action',
      maxTargets: 10,
      hitCount: 8,
      damagePercent: 560,
    },
  ],
  '소드 오브 버닝 소울-일반': [
    {
      type: 'nonAction',
      maxTargets: 8,
      hitCount: 12,
      damagePercent: skillFormula.level(9, { base: 200 }),
    },
  ],
  '소드 오브 버닝 소울-고정': [
    {
      type: 'nonAction',
      maxTargets: 8,
      hitCount: 6,
      damagePercent: skillFormula.level(5, { base: 102 }),
    },
  ],
  '콤보 데스폴트': [
    {
      type: 'action',
      maxTargets: 15,
      damagePercent: skillFormula.level(16, { base: 400 }),
      hitCount: 14,
    },
  ],
  '공간의 상처': [
    {
      type: 'nonAction',
      maxTargets: 6,
      hitCount: 6,
      repeatCount: 3,
      damagePercent: skillFormula.level(7, { base: 190 }),
    },
  ],
  '영혼의 잔흔': [
    {
      type: 'nonAction',
      maxTargets: 1,
      hitCount: 1,
      damagePercent: skillFormula.level(16, { base: 390 }),
      trigger: {
        triggerOn: 'hit',
        skills: ['스피릿 칼리버'],
      },
    },
  ],
  '소드 일루전': [
    {
      type: 'action',
      name: '참격',
      maxTargets: 8,
      hitCount: 4,
      repeatCount: 12,
      damagePercent: skillFormula.level(5, { base: 125 }),
    },
    {
      type: 'action',
      name: '폭발',
      maxTargets: 8,
      hitCount: 5,
      repeatCount: 5,
      damagePercent: skillFormula.level(10, { base: 210 }),
    },
  ],
  '레이징 블로우 VI': [
    {
      type: 'action',
      maxTargets: 8,
      hitCount: 4,
      damagePercent: skillFormula.level(6, { base: 350 }),
    },
  ],
  '강화 레이징 블로우 VI': [
    {
      type: 'action',
      maxTargets: 8,
      hitCount: 4,
      damagePercent: skillFormula.level(10, { base: 421 }),
    },
  ],
  '레이지 업라이징 VI': [
    {
      type: 'action',
      maxTargets: 10,
      hitCount: 8,
      repeatCount: 4,
      damagePercent: skillFormula.level(5, { base: 191 }),
    },
  ],
  '오라 블레이드 VI': [
    {
      type: 'action',
      maxTargets: 8,
      hitCount: 5,
      damagePercent: skillFormula.level(6, { base: 328 }),
      addNormalMobDamagePercent: skillFormula.level(3, { base: 200 }),
    },
  ],
  '파이널 블레이드': [
    {
      type: 'action',
      maxTargets: 8,
      hitCount: 5,
      damagePercent: skillFormula.level(8, { base: 522 }),
    },
  ],
  '퓨리어스 엣지': [
    {
      type: 'nonAction',
      name: '검의 상흔',
      maxTargets: 8,
      hitCount: 3,
      damagePercent: skillFormula.level(4, { base: 121 }),
      cycleCount: 32,
      trigger: {
        triggerOn: 'directAttackHit',
        requiredHitCount: 5,
        countRules: [
          {
            skills: ['발할라', '공간의 상처', '스피릿 칼리버'],
            hitCountPerTriggerCount: 2,
          },
        ],
      },
    },
  ],
  '발할라 VI': [
    {
      type: 'nonAction',
      maxTargets: 6,
      hitCount: 5,
      repeatCount: 3,
      cycleCount: 12,
      damagePercent: skillFormula.level(6, { base: 224 }),
    },
  ],
  '인사이징 VI': [
    {
      type: 'action',
      maxTargets: 8,
      hitCount: 4,
      damagePercent: skillFormula.level(7, { base: 430 }),
      stats: [
        {
          stat: 'normalDamage',
          amount: 50,
        },
      ],
    },
  ],
  '파이널 어택 VI': [
    {
      type: 'nonAction',
      maxTargets: 1,
      hitCount: 3,
      damagePercent: skillFormula.level(3, { base: 186 }),
      trigger: {
        triggerOn: 'directAttackHit',
        chancePercent: 61,
      },
    },
  ],
  '스피릿 칼리버': [
    {
      type: 'action',
      name: '참격',
      maxTargets: 15,
      hitCount: 14,
      repeatCount: 33,
      damagePercent: skillFormula.level(8, { base: 232 }),
    },
    {
      type: 'action',
      name: '마무리 일격',
      maxTargets: 15,
      hitCount: 15,
      repeatCount: 48,
      damagePercent: skillFormula.level(6, { base: 230 }),
    },
  ],
  '사일런트 클리브': [
    {
      type: 'nonAction',
      maxTargets: 15,
      hitCount: 15,
      repeatCount: 24,
      damagePercent: skillFormula.level(249, { base: 1255 }),
    },
  ],
} as const satisfies SkillAttackTable<HeroAttackSkillName>;
