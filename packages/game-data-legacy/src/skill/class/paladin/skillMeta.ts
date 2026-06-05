import type { PaladinSkillName } from './skillName';

import type { ActiveSkillNameFromSkillMeta, AttackSkillNameFromSkillMeta, SkillMeta } from '@/skill/types';
import { hexamatrixEnhanceCore, vmatrixEnhanceCore, hyperPassiveSkill } from '@/skill/types';

export const paladinSkillMeta = {
  '인빈서블 빌리프': {
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  // 1차스킬
  '슬래시 블러스트': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 20,
  },
  '워리어 리프': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'movement' }],
    maxLevel: 5,
  },
  '리프 어택': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 1,
  },
  '아이언 바디': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 20,
  },
  '워리어 마스터리': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 20,
  },

  // 2차스킬
  '디바인 스윙': {
    maxLevel: 20,
    tags: ['홀리 포스'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '페이지 오더': {
    maxLevel: 9,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '홀리 차지': {
    maxLevel: 1,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '웨폰 액셀레이션': {
    maxLevel: 10,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
    requiredSkill: [
      {
        name: '웨폰 마스터리',
        level: 5,
      },
    ],
  },
  스탠스: {
    maxLevel: 30,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '웨폰 마스터리': {
    maxLevel: 10,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '파이널 어택': {
    maxLevel: 20,
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'finalAttack',
      },
    ],
    requiredSkill: [
      {
        name: '웨폰 마스터리',
        level: 3,
      },
    ],
  },
  '피지컬 트레이닝': {
    maxLevel: 5,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },

  // 3차 스킬
  '디바인 차지': {
    maxLevel: 20,
    tags: ['홀리 포스'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  리스토네이션: {
    maxLevel: 10,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  돌진: {
    maxLevel: 10,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'movement',
      },
    ],
  },
  '노블 디맨드': {
    maxLevel: 20,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'debuff',
      },
    ],
  },
  '파라쇼크 가드': {
    maxLevel: 10,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '컴뱃 오더스': {
    maxLevel: 20,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
    requiredSkill: [
      {
        name: '리스토네이션',
        level: 5,
      },
    ],
  },
  '실드 마스터리': {
    maxLevel: 10,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  아킬레스: {
    maxLevel: 14,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '블레싱 아머': {
    maxLevel: 10,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },

  // 4차 스킬
  '디바인 스티그마': {
    maxLevel: 30,
    isCombatOrders: true,
    tags: ['홀리 포스'],
    requiredSkill: [
      {
        name: '디바인 차지',
        level: 20,
      },
    ],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'replace',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveSkillEnhancement',
      },
    ],
  },
  '디바인 스티그마-성흔폭발': {
    levelSource: '디바인 스티그마',
    isInternal: true,
    tags: ['홀리 포스'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  블래스트: {
    maxLevel: 30,
    isCombatOrders: true,
    tags: ['홀리 포스'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '디바인 저지먼트': {
    maxLevel: 30,
    isCombatOrders: true,
    requiredSkill: [
      {
        name: '블래스트',
        level: 5,
      },
    ],
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '매직 크래쉬': {
    maxLevel: 10,
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'debuff',
      },
    ],
  },
  생츄어리: {
    maxLevel: 30,
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '디바인 블레싱': {
    maxLevel: 30,
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '메이플 용사': {
    maxLevel: 30,
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'effect',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '용사의 의지': {
    maxLevel: 5,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '가디언 스피릿': {
    maxLevel: 20,
    isCombatOrders: true,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '팔라딘 엑스퍼트': {
    maxLevel: 30,
    isCombatOrders: true,
    requiredSkill: [
      {
        name: '웨폰 마스터리',
        level: 10,
      },
    ],
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },
  '어드밴스드 홀리 차지': {
    maxLevel: 10,
    isCombatOrders: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
  },

  // Hyper Passive 스킬
  '디바인 차지-리인포스': hyperPassiveSkill,
  '디바인 차지-크리티컬 레이트': hyperPassiveSkill,
  '디바인 차지-보너스 어택': hyperPassiveSkill,
  '블래스트-리인포스': hyperPassiveSkill,
  '블래스트-크리티컬 레이트': hyperPassiveSkill,
  '블래스트-보너스 어택': hyperPassiveSkill,
  '생츄어리-리인포스': hyperPassiveSkill,
  '생츄어리-쿨타임 리듀스': hyperPassiveSkill,
  '생츄어리-보너스 어택': hyperPassiveSkill,
  // Hyper Active 스킬
  새크로생티티: {
    maxLevel: 1,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  스마이트: {
    maxLevel: 1,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '에픽 어드벤쳐': {
    maxLevel: 1,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '홀리 유니티': {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '홀리 유니티-결속': {
    isInternal: true,
    levelSource: '홀리 유니티',
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'trigger',
      },
    ],
  },
  '블래스트-결속': {
    isInternal: true,
    levelSource: '블래스트',
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '디바인 차지-결속': {
    isInternal: true,
    levelSource: '디바인 차지',
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '디바인 스티그마-결속': {
    isInternal: true,
    levelSource: '디바인 스티그마',
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '생츄어리-결속': {
    isInternal: true,
    levelSource: '생츄어리',
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '블래스드 해머': {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'summon',
      },
    ],
  },
  '그랜드 크로스': {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'keyDown',
      },
    ],
  },
  '마이티 묠니르': {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'projectile',
      },
    ],
  },
  '블래스트 강화': vmatrixEnhanceCore,
  '디바인 저지먼트 강화': vmatrixEnhanceCore,
  '디바인 차지 강화': vmatrixEnhanceCore,
  '디바인 스티그마 강화': vmatrixEnhanceCore,
  '생츄어리 강화': vmatrixEnhanceCore,
  '파이널 어택 강화': vmatrixEnhanceCore,
  '스마이트 강화': vmatrixEnhanceCore,
  '리프 어택 강화': vmatrixEnhanceCore,
  '돌진 강화': vmatrixEnhanceCore,
  '디바인 스윙 강화': vmatrixEnhanceCore,
  '페이지 오더 강화': vmatrixEnhanceCore,
  '블래스트 VI': {
    maxLevel: 30,
    tags: ['홀리 포스'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '디바인 저지먼트 VI': {
    levelSource: '블래스트 VI',
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '블래스트 VI-결속': {
    levelSource: '블래스트 VI',
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '디바인 차지 VI': {
    maxLevel: 30,
    tags: ['홀리 포스'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '디바인 차지 VI-결속': {
    isInternal: true,
    levelSource: '디바인 차지 VI',
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '디바인 스티그마 VI': {
    levelSource: '디바인 차지 VI',
    tags: ['홀리 포스'],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'replace',
      },
    ],
  },
  '디바인 스티그마 VI-결속': {
    levelSource: '디바인 스티그마 VI',
    isInternal: true,
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '폴링 저스티스': {
    levelSource: '디바인 차지 VI',
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '생츄어리 VI': {
    maxLevel: 30,
    requiredSkill: [
      {
        name: '생츄어리',
        level: 30,
      },
    ],
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveSkillEnhancement',
      },
    ],
  },
  '파이널 어택 VI': {
    maxLevel: 30,
    requiredSkill: [
      {
        name: '파이널 어택',
        level: 20,
      },
    ],
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'finalAttack',
      },
    ],
  },
  '라이징 저스티스': {
    levelSource: '파이널 어택 VI',
    requiredSkill: [
      {
        name: '폴링 저스티스',
        level: 1,
      },
    ],
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
  },
  '홀리 유니티 강화': hexamatrixEnhanceCore,
  '블래스드 해머 강화': hexamatrixEnhanceCore,
  '그랜드 크로스 강화': hexamatrixEnhanceCore,
  '마이티 묠니르 강화': hexamatrixEnhanceCore,
  '세이크리드 바스티온': {
    isOrigin: true,
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
  '도미누스 오브리온': {
    isAscent: true,
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
  },
} as const satisfies Record<PaladinSkillName, SkillMeta<PaladinSkillName>>;

export type PaladinAttackSkillName = AttackSkillNameFromSkillMeta<typeof paladinSkillMeta>;
export type PaladinActiveSkillName = ActiveSkillNameFromSkillMeta<typeof paladinSkillMeta>;
