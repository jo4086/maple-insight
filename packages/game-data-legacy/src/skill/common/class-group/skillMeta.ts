import type { ClassGroupSkillName } from './skillName';

import { type ActiveSkillNameFromSkillMeta, type AttackSkillNameFromSkillMeta, type SkillMeta } from '@/skill/types';

export const classGroupSkillMeta = {
  '바디 오브 스틸': {
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
      {
        activation: 'passive',
        combatKind: 'nonAttack',
        kind: 'passiveStat',
      },
    ],
    maxLevel: 30,
  },
  '오라 웨폰': {
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
    maxLevel: 30,
  },
  '오버로드 마나': {
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'toggle',
      },
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
    maxLevel: 30,
  },
  '에테리얼 폼': {
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
    maxLevel: 30,
  },
  '가이디드 애로우': {
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'toggle',
      },
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'summon',
      },
    ],
    maxLevel: 30,
  },
  '크리티컬 리인포스': {
    rules: {
      allowsCriticalRateOverflow: true,
    },
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '베놈 버스트': {
    effects: [
      {
        activation: 'passive',
        combatKind: 'attack',
        kind: 'damageOverTime',
      },
    ],
    maxLevel: 30,
  },
  '레디 투 다이': {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '오버 드라이브': {
    maxLevel: 30,
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
  '로디드 다이스': {
    maxLevel: 30,
    rules: {
      selectableBuff: {
        variants: ['dice1', 'dice2', 'dice3', 'dice4', 'dice5', 'dice6'],
        selectCount: 1,
        allowDuplicate: false,
        mergeStrategy: 'overwrite',
      },
    },
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'toggle',
      },
    ],
  },
  '럭키 다이스': {
    maxLevel: 30,
    rules: {
      randomBuff: {
        variants: ['dice1', 'dice2', 'dice3', 'dice4', 'dice5', 'dice6'],
        selectCount: 1,
        allowDuplicate: true,
        mergeStrategy: 'overwrite',
      },
    },
    effects: [
      {
        activation: 'active',
        combatKind: 'nonAttack',
        kind: 'buff',
      },
    ],
  },
} as const satisfies Partial<Record<ClassGroupSkillName, SkillMeta<ClassGroupSkillName>>>;

export type ClassGroupAttackSkillName = AttackSkillNameFromSkillMeta<typeof classGroupSkillMeta>;
export type ClassGroupActiveSkillName = ActiveSkillNameFromSkillMeta<typeof classGroupSkillMeta>;
