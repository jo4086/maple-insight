import type { LenSkillName } from './skillName';

import { hexamatrixEnhanceCore, hyperPassiveSkill, vmatrixEnhanceCore } from '@/skill/types';
import type { ActiveSkillNameFromSkillMeta, AttackSkillNameFromSkillMeta, SkillMeta } from '@/skill/types';

export const lenSkillMeta = {
  강체: {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },
  복귀: {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'mapTeleport' }],
  },
  '매화검 본초 : 참': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 20,
  },
  청풍보: {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'movement' }],
    maxLevel: 5,
  },
  매화비보: {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'movement' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' },
    ],
    maxLevel: 10,
  },
  청풍유심: {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 10,
  },
  청허심경: {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 20,
  },

  '매화검 본초 : 자': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 20,
  },
  '매화검 1초식 : 순인': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'movement' }],
    maxLevel: 20,
  },
  '매화검 1초식 : 순인-발검': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'movement' }],
    maxLevel: 20,
  },
  '매화검 1초식 : 순인-납검': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'movement' }],
    maxLevel: 20,
  },
  '장검 가속': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
    maxLevel: 10,
  },
  '망혼검 본초 : 영격': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 20,
  },
  '장검 숙련': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 10,
  },
  '신체 단련': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 4,
  },
  '청허심경 II': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 10,
  },

  '매화검 본초 : 천': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 20,
  },
  '매화검 2초식 : 쇄매': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'projectile' }],
    maxLevel: 20,
  },
  '망혼검 본초 : 영격 II': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 10,
    requiredSkill: [{ name: '망혼검 본초 : 영격', level: 20 }],
  },
  '망혼검 1초식 : 운기': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'buff' }],
    maxLevel: 14,
  },
  망혼강림: {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'trigger' }],
    maxLevel: 1,
  },
  '망혼검 절기 : 열지': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 20,
  },
  '청허심경 III': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 20,
  },
  강신: {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },

  '매화검 본초 : 선참': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'keyDown' }],
    maxLevel: 30,
    isCombatOrders: true,
  },
  오도: {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'effect' }],
    maxLevel: 1,
  },
  '매화검 3초식 : 예인': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'summon' }],
    maxLevel: 20,
    isCombatOrders: true,
  },
  '매화검 3초식 : 일격예인': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'summon' }],
    levelSource: '매화검 3초식 : 예인',
  },
  '매화검 4초식 : 영인': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
    ],
    maxLevel: 10,
  },
  '망혼검 본초 : 영격 III': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    isCombatOrders: true,
    requiredSkill: [
      {
        name: '망혼검 본초 : 영격 II',
        level: 10,
      },
    ],
  },
  '망혼검 2초식 : 연참': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 20,
    isCombatOrders: true,
  },
  '망혼검 절기 : 망탄': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    isCombatOrders: true,
  },
  '아니마의 용사': {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'effect' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' },
    ],
    maxLevel: 30,
    isCombatOrders: true,
  },
  '아니마 용사의 의지': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
    maxLevel: 5,
  },
  '고급 장검 숙련': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 30,
    isCombatOrders: true,
  },
  '청허심경 IV': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 30,
    isCombatOrders: true,
  },
  진안: {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 20,
    isCombatOrders: true,
  },

  '매화검 5초식 : 천매지박': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 1,
  },
  승화: {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
    maxLevel: 1,
  },
  '망혼검 절기 : 무량겁': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 1,
  },
  '망혼검 본초 : 영격-리인포스': hyperPassiveSkill,
  '망혼검 본초 : 영격-엑스트라 타겟': hyperPassiveSkill,
  '망혼검 본초 : 영격-이그노어 가드': hyperPassiveSkill,
  '매화검 본초 : 선참-리인포스': hyperPassiveSkill,
  '매화검 본초 : 선참-이그노어 가드': hyperPassiveSkill,
  '매화검 본초 : 선참-보스 킬러': hyperPassiveSkill,
  '망혼강림-리인포스': hyperPassiveSkill,
  '망혼강림-이그노어 가드': hyperPassiveSkill,
  '망혼강림-크리티컬 레이트': hyperPassiveSkill,

  '매화검 절기 : 만리향': {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'trigger' },
    ],
    maxLevel: 30,
  },
  '매화검 절기 : 만리향-참매': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'triggered' }],
    levelSource: '매화검 절기 : 만리향',
  },
  '매화검 절기 : 만리향-매화꽃': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'triggered' }],
    levelSource: '매화검 절기 : 만리향',
  },
  망혼각성: {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'trigger' },
    ],
    maxLevel: 30,
  },
  '망혼각성-천아': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'triggered' }],
    levelSource: '망혼각성',
  },
  '망혼각성-천겁': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'triggered' }],
    levelSource: '망혼각성',
  },
  '매화검 절기 : 섬무': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'keyDown' }],
    maxLevel: 30,
  },
  '망혼검 절기 : 심검': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'active', combatKind: 'attack', kind: 'projectile' },
    ],
  },
  '매화검 본초 : 선참 강화': vmatrixEnhanceCore,
  '망혼검 본초 : 영격 강화': vmatrixEnhanceCore,
  '망혼검 2초식 : 연참 강화': vmatrixEnhanceCore,
  '망혼검 절기 : 열지 강화': vmatrixEnhanceCore,
  '망혼검 절기 : 망탄 강화': vmatrixEnhanceCore,
  '망혼검 절기 : 무량겁 강화': vmatrixEnhanceCore,
  '매화검 2초식 : 쇄매 강화': vmatrixEnhanceCore,
  '매화검 3초식 : 예인 강화': vmatrixEnhanceCore,
  '매화검 4초식 : 영인 강화': vmatrixEnhanceCore,
  '매화검 본초 : 천 강화': vmatrixEnhanceCore,
  '매화검 본초 : 참 강화': vmatrixEnhanceCore,
  '매화검 본초 : 자 강화': vmatrixEnhanceCore,

  '창룡파천검 : 승천': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    isOrigin: true,
  },
  '창룡파천검 : 일매낙화 천비인적': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'trigger' }],
    maxLevel: 30,
    isAscent: true,
  },
  '창룡파천검 : 일매낙화 천비인적-낙화': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
  },
  '창룡파천검 : 일매낙화 천비인적-진천': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
  },
  '창룡파천검 : 일매낙화 천비인적-천강': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
  },
  '매화검 본초 : 선참 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'keyDown' }],
    maxLevel: 30,
    requiredSkill: [{ name: '매화검 본초 : 선참', level: 30 }],
  },
  '망혼검 본초 : 영격 VI': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    requiredSkill: [{ name: '망혼검 본초 : 영격', level: 30 }],
  },
  '망혼검 2초식 : 연참 VI': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    requiredSkill: [{ name: '망혼검 2초식 : 연참', level: 20 }],
  },
  '망혼강림 VI': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'trigger' }],
    maxLevel: 30,
  },
  '망혼강림 VI-검기': {
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
    levelSource: '망혼강림 VI',
  },
  '망혼검 절기 : 열지 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    requiredSkill: [
      { name: '망혼검 절기 : 열지', level: 20 },
      { name: '망혼검 절기 : 망탄', level: 30 },
      { name: '망혼검 절기 : 무량겁', level: 1 },
    ],
  },
  '망혼검 절기 : 망탄 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    requiredSkill: [
      { name: '망혼검 절기 : 열지', level: 20 },
      { name: '망혼검 절기 : 망탄', level: 30 },
      { name: '망혼검 절기 : 무량겁', level: 1 },
    ],
  },
  '망혼검 절기 : 무량겁 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    requiredSkill: [
      { name: '망혼검 절기 : 열지', level: 20 },
      { name: '망혼검 절기 : 망탄', level: 30 },
      { name: '망혼검 절기 : 무량겁', level: 1 },
    ],
  },
  '매화검 2초식 : 쇄매 VI': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'projectile' }],
    maxLevel: 30,
    requiredSkill: [{ name: '매화검 2초식 : 쇄매', level: 20 }],
  },
  '매화검 3초식 : 예인 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'summon' }],
    maxLevel: 30,
    requiredSkill: [{ name: '매화검 3초식 : 예인', level: 20 }],
  },
  '매화검 3초식 : 일격예인 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'summon' }],
    levelSource: '매화검 3초식 : 예인 VI',
    requiredSkill: [{ name: '매화검 3초식 : 예인', level: 20 }],
  },
  '망혼각성 강화': hexamatrixEnhanceCore,
  '매화검 절기 : 만리향 강화': hexamatrixEnhanceCore,
  '매화검 절기 : 섬무 강화': hexamatrixEnhanceCore,
  '망혼검 절기 : 심검 강화': hexamatrixEnhanceCore,
} as const satisfies Record<LenSkillName, SkillMeta<LenSkillName>>;

export type LenAttackSkillName = AttackSkillNameFromSkillMeta<typeof lenSkillMeta>;
export type LenActiveSkillName = ActiveSkillNameFromSkillMeta<typeof lenSkillMeta>;
