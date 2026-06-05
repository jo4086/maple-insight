import type { LenAttackSkillName } from './skillMeta';

import { skillFormula, type SkillAttackTable } from '@/skill/types';

export const lenSkillAttack = {
  '매화검 본초 : 참': [
    {
      type: 'action',
      damagePercent: 210,
      hitCount: 2,
    },
  ],
  '매화검 본초 : 자': [
    {
      type: 'action',
      damagePercent: 263,
      hitCount: 3,
    },
  ],
  '망혼검 본초 : 영격': [
    {
      type: 'nonAction',
      maxTargets: 8,
      damagePercent: 300,
      hitCount: 4,
      trigger: {
        triggerOn: 'hit',
        skills: ['매화검 본초 : 참', '매화검 본초 : 자', '매화검 본초 : 천', '매화검 본초 : 선참', '매화검 절기 : 섬무'],
        chancePercent: 35,
      },
    },
  ],
  '매화검 본초 : 천': [
    {
      type: 'action',
      damagePercent: 408,
      hitCount: 4,
      maxTargets: 6,
    },
  ],
  '매화검 2초식 : 쇄매': [
    {
      type: 'nonAction',
      damagePercent: 120,
      name: '매화 꽃잎',
      hitCount: 3,
      repeatCount: 5,
      trigger: {
        triggerOn: 'directAttackHit',
        chancePercent: 35,
      },
    },
  ],
  '망혼검 본초 : 영격 II': [
    {
      type: 'nonAction',
      maxTargets: 8,
      damagePercent: 450,
      hitCount: 4,
      trigger: {
        triggerOn: 'hit',
        skills: ['매화검 본초 : 참', '매화검 본초 : 자', '매화검 본초 : 천', '매화검 본초 : 선참', '매화검 절기 : 섬무'],
        chancePercent: 35,
      },
    },
  ],
  '망혼검 절기 : 열지': [
    {
      type: 'action',
      maxTargets: 10,
      damagePercent: 550,
      hitCount: 5,
    },
    {
      type: 'action',
      maxTargets: 10,
      damagePercent: 689,
      hitCount: 7,
    },
  ],
  '매화검 본초 : 선참': [
    {
      type: 'action',
      maxTargets: 8,
      damagePercent: { type: 'linear', base: 108, perLevel: 2 },
      hitCount: 5,
    },
  ],
  '매화검 3초식 : 예인': [
    {
      type: 'action',
      maxTargets: 6,
      damagePercent: { type: 'linear', base: 290, perLevel: 10 },
      hitCount: 4,
    },
  ],
  '매화검 3초식 : 일격예인': [
    {
      type: 'action',
      maxTargets: 6,
      damagePercent: { type: 'linear', base: 130, perLevel: 4 },
      hitCount: 7,
      repeatCount: 20,
    },
  ],
  '매화검 4초식 : 영인': [
    {
      type: 'action',
      maxTargets: 8,
      damagePercent: 395,
      hitCount: 6,
    },
  ],
  '망혼검 본초 : 영격 III': [
    {
      type: 'nonAction',
      maxTargets: 8,
      damagePercent: { type: 'linear', base: 443, perLevel: 10 },
      hitCount: 4,
      trigger: {
        triggerOn: 'hit',
        skills: ['매화검 본초 : 참', '매화검 본초 : 자', '매화검 본초 : 천', '매화검 본초 : 선참', '매화검 절기 : 섬무'],
        chancePercent: 35,
      },
    },
  ],
  '망혼검 2초식 : 연참': [
    {
      type: 'nonAction',
      maxTargets: 1,
      damagePercent: { type: 'linear', base: 149, perLevel: 6 },
      hitCount: 2,
      trigger: {
        triggerOn: 'directAttackHit',
        chancePercent: { type: 'linear', base: 30, perLevel: 2 },
      },
    },
  ],
  '망혼검 절기 : 망탄': [
    {
      type: 'action',
      maxTargets: 10,
      damagePercent: { type: 'linear', base: 981, perLevel: 9 },
      hitCount: 9,
    },
  ],
  '매화검 5초식 : 천매지박': [
    {
      type: 'action',
      maxTargets: 15,
      damagePercent: 720,
      hitCount: 12,
    },
  ],
  '망혼검 절기 : 무량겁': [
    {
      type: 'action',
      maxTargets: 12,
      damagePercent: 380,
      hitCount: 7,
      repeatCount: 8,
    },
    {
      type: 'nonAction',
      name: '지속피해',
      maxTargets: 1,
      damagePercent: 250,
      hitCount: 3,
      durationSec: 5,
      tickIntervalSec: 1,
      canCritical: false,
    },
  ],
  '매화검 절기 : 만리향-참매': [
    {
      type: 'nonAction',
      maxTargets: 12,
      damagePercent: skillFormula.level(5, { base: 130 }),
      hitCount: 3,
      durationSec: 30,
    },
  ],
  '매화검 절기 : 만리향-매화꽃': [
    {
      type: 'nonAction',
      maxTargets: 1,
      damagePercent: skillFormula.level(9, { base: 230 }),
      hitCount: 3,
      repeatCount: 125,
      condition: '참매 누적 30/70/125회 도달시 각각 20/40/65개 생성',
    },
  ],
  '망혼각성-천아': [
    {
      type: 'nonAction',
      maxTargets: 12,
      damagePercent: { type: 'linear', base: 270, perLevel: 11 },
      hitCount: 2,
      durationSec: 20,
      trigger: {
        triggerOn: 'directAttackHit',
        countRules: [
          {
            skills: [
              '매화검 본초 : 선참',
              '매화검 본초 : 선참 VI',
              '매화검 절기 : 섬무',
              '매화검 3초식 : 예인',
              '매화검 3초식 : 예인 VI',
              '매화검 3초식 : 일격예인',
              '매화검 3초식 : 일격예인 VI',
            ],
            hitCountPerTriggerCount: 3,
          },
        ],
      },
      condition: '직접 공격 적중 시 1회 발동. 단 선참/선참 VI/섬무/예인/예인 VI/일격예인/일격예인 VI는 3번 적중 시 1회 발동',
    },
  ],
  '망혼각성-천겁': [
    {
      type: 'nonAction',
      maxTargets: 15,
      damagePercent: { type: 'linear', base: 900, perLevel: 35 },
      hitCount: 12,
      repeatCount: 9,
      condition: '천아 90회 발동 시 발동',
    },
  ],
  '매화검 절기 : 섬무': [
    {
      type: 'action',
      maxTargets: 15,
      damagePercent: { type: 'linear', base: 480, perLevel: 19 },
      hitCount: 6,
      repeatCount: 56,
    },
  ],
  '망혼검 절기 : 심검': [
    {
      type: 'action',
      maxTargets: 15,
      damagePercent: { type: 'linear', base: 540, perLevel: 22 },
      hitCount: 10,
    },
    {
      type: 'nonAction',
      maxTargets: 1,
      damagePercent: { type: 'linear', base: 690, perLevel: 27 },
      hitCount: 3,
      repeatCount: 12,
    },
  ],
  '매화검 본초 : 선참 VI': [
    {
      type: 'action',
      maxTargets: 8,
      damagePercent: { type: 'linear', base: 202, perLevel: 3 },
      hitCount: 5,
    },
  ],
  '망혼검 본초 : 영격 VI': [
    {
      type: 'nonAction',
      maxTargets: 8,
      damagePercent: { type: 'linear', base: 820, perLevel: 13 },
      hitCount: 4,
      trigger: {
        triggerOn: 'hit',
        skills: ['매화검 본초 : 참', '매화검 본초 : 자', '매화검 본초 : 천', '매화검 본초 : 선참', '매화검 절기 : 섬무'],
        chancePercent: 35,
      },
    },
  ],
  '망혼검 2초식 : 연참 VI': [
    {
      type: 'nonAction',
      maxTargets: 1,
      damagePercent: { type: 'linear', base: 235, perLevel: 4 },
      hitCount: 2,
      trigger: {
        triggerOn: 'directAttackHit',
        chancePercent: 62,
      },
    },
  ],
  '망혼강림 VI-검기': [
    {
      type: 'nonAction',
      maxTargets: 8,
      damagePercent: { type: 'linear', base: 840, perLevel: 18 },
      hitCount: 5,
      repeatCount: 2,
      trigger: {
        triggerOn: 'directAttackHit',
        skills: [
          '망혼검 절기 : 열지',
          '망혼검 절기 : 망탄',
          '망혼검 절기 : 무량겁',
          '망혼검 절기 : 심검',
          '망혼검 절기 : 열지 VI',
          '망혼검 절기 : 망탄 VI',
          '망혼검 절기 : 무량겁 VI',
        ],
        requiredHitCount: 8,
      },
    },
  ],
  '망혼검 절기 : 열지 VI': [
    {
      type: 'action',
      maxTargets: 10,
      damagePercent: { type: 'linear', base: 850, perLevel: 10 },
      hitCount: 5,
    },
    {
      type: 'action',
      maxTargets: 10,
      damagePercent: {
        type: 'linear',
        base: 900,
        perLevel: 15,
      },
      hitCount: 7,
    },
  ],
  '망혼검 절기 : 망탄 VI': [
    {
      type: 'action',
      maxTargets: 10,
      damagePercent: {
        type: 'linear',
        base: 1350,
        perLevel: 30,
      },
      hitCount: 9,
    },
  ],
  '망혼검 절기 : 무량겁 VI': [
    {
      type: 'action',
      name: '참격',
      maxTargets: 12,
      damagePercent: {
        type: 'linear',
        base: 400,
        perLevel: 7,
      },
      hitCount: 7,
      repeatCount: 8,
    },
    {
      type: 'nonAction',
      name: '발화',
      maxTargets: 1,
      damagePercent: {
        type: 'linear',
        base: 335,
        perLevel: 2,
      },
      hitCount: 3,
      durationSec: 5,
      canCritical: false,
      tickIntervalSec: 1,
    },
  ],
  '매화검 2초식 : 쇄매 VI': [
    {
      type: 'nonAction',
      name: '매화 꽃잎',
      maxTargets: 1,
      damagePercent: {
        type: 'linear',
        base: 120,
        perLevel: 2,
      },
      hitCount: 3,
      repeatCount: 5,
      stats: [
        {
          stat: 'normalDamage',
          amount: {
            type: 'linear',
            base: 120,
            perLevel: 5,
          },
        },
      ],
    },
  ],
  '매화검 3초식 : 예인 VI': [
    {
      type: 'action',
      maxTargets: 6,
      damagePercent: {
        type: 'linear',
        base: 660,
        perLevel: 12,
      },
      hitCount: 4,
      repeatCount: 3,
    },
  ],
  '매화검 3초식 : 일격예인 VI': [
    {
      type: 'action',
      maxTargets: 6,
      damagePercent: {
        type: 'linear',
        base: 246,
        perLevel: 4,
      },
      hitCount: 7,
      repeatCount: 20,
    },
  ],
  '창룡파천검 : 승천': [
    {
      type: 'action',
      name: '파동',
      maxTargets: 15,
      damagePercent: {
        type: 'linear',
        base: 750,
        perLevel: 25,
      },
      hitCount: 12,
      repeatCount: 58,
    },
    {
      type: 'action',
      name: '참격',
      maxTargets: 15,
      damagePercent: {
        type: 'linear',
        base: 1050,
        perLevel: 35,
      },
      hitCount: 15,
      repeatCount: 27,
    },
  ],
  '창룡파천검 : 일매낙화 천비인적-낙화': [
    {
      type: 'nonAction',
      maxTargets: 15,
      damagePercent: {
        type: 'linear',
        base: 435,
        perLevel: 88,
      },
      hitCount: 7,
      repeatCount: 30,
    },
  ],
  '창룡파천검 : 일매낙화 천비인적-진천': [
    {
      type: 'nonAction',
      maxTargets: 15,
      damagePercent: {
        type: 'linear',
        base: 770,
        perLevel: 156,
      },
      hitCount: 10,
      repeatCount: 15,
    },
  ],
  '창룡파천검 : 일매낙화 천비인적-천강': [
    {
      type: 'nonAction',
      maxTargets: 15,
      damagePercent: {
        type: 'linear',
        base: 528,
        perLevel: 105,
      },
      hitCount: 15,
      repeatCount: 25,
    },
  ],
} as const satisfies SkillAttackTable<LenAttackSkillName>;
