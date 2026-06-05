import type { HeroSkillName } from './skillName';

import { hexamatrixEnhanceCore, hyperPassiveSkill, vmatrixEnhanceCore } from '@/skill/types';
import type { ActiveSkillNameFromSkillMeta, AttackSkillNameFromSkillMeta, SkillMeta } from '@/skill/types';

export const heroSkillMeta = {
  '인빈서블 빌리프': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
  },

  /** 1차 스킬 */
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

  /** 2차 스킬 */
  브랜디쉬: {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    tags: ['검술'],
    maxLevel: 20,
  },
  '플래시 슬래시': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'movement' },
    ],
    maxLevel: 9,
  },
  '콤보 어택': {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'toggle' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
    ],
    maxLevel: 1,
  },
  '스피릿 블레이드': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
    maxLevel: 20,
  },
  '웨폰 마스터리': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 10,
  },
  '웨폰 액셀레이션': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 10,
    requiredSkill: [
      {
        name: '웨폰 마스터리',
        level: 5,
      },
    ],
  },
  '파이널 어택': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'finalAttack' }],
    maxLevel: 20,
    requiredSkill: [
      {
        name: '웨폰 마스터리',
        level: 3,
      },
    ],
  },
  '피지컬 트레이닝': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 5,
  },

  /** 3차 스킬 */
  '브레이브 슬래시': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    tags: ['검술'],
    maxLevel: 20,
  },
  '오라 블레이드': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'projectile' }],
    maxLevel: 20,
  },
  돌진: {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'movement' },
    ],
    maxLevel: 10,
  },
  '스카링 소드': {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'trigger' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'debuff' },
    ],
    maxLevel: 20,
  },
  '콤보 시너지': {
    effects: [
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' },
    ],
    maxLevel: 20,
  },
  '셀프 리커버리': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 10,
  },
  '찬스 어택': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 10,
  },
  인듀어: {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 14,
  },

  /** 4차 스킬 */
  '레이징 블로우': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' },
    ],
    tags: ['검술'],
    maxLevel: 30,
    isCombatOrders: true,
  },
  '강화 레이징 블로우': {
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
    tags: ['검술'],
    levelSource: '레이징 블로우',
  },
  인사이징: {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'debuff' },
    ],
    maxLevel: 30,
    requiredSkill: [
      {
        name: '어드밴스드 콤보',
        level: 20,
      },
    ],
    isCombatOrders: true,
  },
  '매직 크래쉬': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'debuff' }],
    maxLevel: 10,
    isCombatOrders: true,
  },
  인레이지: {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 30,
    tags: ['검술'],
    requiredSkill: [
      {
        name: '어드밴스드 콤보',
        level: 30,
      },
    ],
    isCombatOrders: true,
  },
  '메이플 용사': {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'effect' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' },
    ],
    maxLevel: 30,
    isCombatOrders: true,
  },
  '용사의 의지': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
    maxLevel: 5,
  },
  '어드밴스드 콤보': {
    effects: [
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' },
    ],
    maxLevel: 30,
    requiredSkill: [
      { name: '웨폰 마스터리', level: 10 },
      { name: '콤보 시너지', level: 20 },
    ],
    isCombatOrders: true,
  },
  '컴뱃 마스터리': {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 30,
    isCombatOrders: true,
  },
  스탠스: {
    effects: [{ activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' }],
    maxLevel: 30,
    isCombatOrders: true,
  },
  '어드밴스드 파이널 어택': {
    effects: [
      { activation: 'passive', combatKind: 'attack', kind: 'finalAttack' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveStat' },
      { activation: 'passive', combatKind: 'nonAttack', kind: 'passiveSkillEnhancement' },
    ],
    maxLevel: 30,
    requiredSkill: [{ name: '파이널 어택', level: 20 }],
    isCombatOrders: true,
  },

  /** hyper 스킬 */
  '어드밴스드 콤보-리인포스': hyperPassiveSkill,
  '어드밴스드 콤보-보너스 찬스': hyperPassiveSkill,
  '어드밴스드 콤보-보스 킬러': hyperPassiveSkill,
  '어드밴스드 파이널 어택-리인포스': hyperPassiveSkill,
  '어드밴스드 파이널 어택-보너스 데미지': hyperPassiveSkill,
  '어드밴스드 파이널 어택-보너스 찬스': hyperPassiveSkill,
  '레이징 블로우-리인포스': hyperPassiveSkill,
  '레이징 블로우-엑스트라 타겟': hyperPassiveSkill,
  '레이징 블로우-보너스 어택': hyperPassiveSkill,
  발할라: {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
      { activation: 'active', combatKind: 'attack', kind: 'triggered' },
    ],
    maxLevel: 1,
  },
  '레이지 업라이징': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 1,
  },
  '에픽 어드벤쳐': {
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'buff' }],
    maxLevel: 1,
  },

  /** 5차 스킬 */
  '소드 오브 버닝 소울': {
    rules: {
      mode: {
        variants: ['fieldSummon', 'fixedSummon'],
        defaultVariant: 'fixedSummon',
      },
    },
    effects: [{ activation: 'active', combatKind: 'nonAttack', kind: 'summon' }],
    maxLevel: 30,
  },
  '소드 오브 버닝 소울-일반': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'summon' }],
    levelSource: '소드 오브 버닝 소울',
  },
  '소드 오브 버닝 소울-고정': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'summon' }],
    levelSource: '소드 오브 버닝 소울',
  },
  '콤보 데스폴트': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
    ],
    maxLevel: 30,
  },
  '콤보 인스팅트': {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'trigger' },
    ],
    requiredSkill: [{ name: '레이징 블로우', level: 30 }],
    maxLevel: 30,
  },
  '공간의 상처': {
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'summon',
      },
    ],
    levelSource: '콤보 인스팅트',
  },
  '영혼의 잔흔': {
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'triggered',
      },
    ],
    levelSource: '콤보 인스팅트',
  },
  '소드 일루전': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
  },
  '레이징 블로우 강화': vmatrixEnhanceCore,
  '레이지 업라이징 강화': vmatrixEnhanceCore,
  '오라 블레이드 강화': vmatrixEnhanceCore,
  '발할라 강화': vmatrixEnhanceCore,
  '인사이징 강화': vmatrixEnhanceCore,
  '파이널 어택 강화': vmatrixEnhanceCore,
  '리프 어택 강화': vmatrixEnhanceCore,
  '돌진 강화': vmatrixEnhanceCore,
  '플래시 슬래시 강화': vmatrixEnhanceCore,
  '브랜디쉬 강화': vmatrixEnhanceCore,
  '브레이브 슬래시 강화': vmatrixEnhanceCore,

  /** 6차 스킬 */
  '레이징 블로우 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    tags: ['검술'],
    requiredSkill: [{ name: '레이징 블로우', level: 30 }],
  },
  '강화 레이징 블로우 VI': {
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'instant',
      },
    ],
    tags: ['검술'],
    levelSource: '레이징 블로우 VI',
  },
  '레이지 업라이징 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    requiredSkill: [{ name: '레이지 업라이징', level: 1 }],
  },
  '오라 블레이드 VI': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'projectile' }],
    maxLevel: 30,
    requiredSkill: [{ name: '오라 블레이드', level: 20 }],
  },
  '파이널 블레이드': {
    effects: [
      {
        activation: 'active',
        combatKind: 'attack',
        kind: 'projectile',
      },
    ],
    levelSource: '오라 블레이드 VI',
  },
  '퓨리어스 엣지': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'summon' }],
    levelSource: '오라 블레이드 VI',
    requiredSkill: [{ name: '오라 블레이드', level: 20 }],
  },
  '발할라 VI': {
    effects: [
      { activation: 'active', combatKind: 'nonAttack', kind: 'buff' },
      { activation: 'active', combatKind: 'attack', kind: 'triggered' },
    ],
    maxLevel: 30,
    requiredSkill: [{ name: '발할라', level: 1 }],
  },
  '인사이징 VI': {
    effects: [
      { activation: 'active', combatKind: 'attack', kind: 'instant' },
      { activation: 'active', combatKind: 'nonAttack', kind: 'debuff' },
    ],
    tags: ['검술'],
    levelSource: '발할라 VI',
    requiredSkill: [{ name: '인사이징', level: 30 }],
  },
  '파이널 어택 VI': {
    effects: [{ activation: 'passive', combatKind: 'attack', kind: 'finalAttack' }],
    levelSource: '발할라 VI',
    requiredSkill: [{ name: '어드밴스드 파이널 어택', level: 30 }],
  },
  '소드 오브 버닝 소울 강화': hexamatrixEnhanceCore,
  '콤보 데스폴트 강화': hexamatrixEnhanceCore,
  '콤보 인스팅트 강화': hexamatrixEnhanceCore,
  '소드 일루전 강화': hexamatrixEnhanceCore,
  '스피릿 칼리버': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    tags: ['검술'],
    maxLevel: 30,
    isOrigin: true,
  },
  '사일런트 클리브': {
    effects: [{ activation: 'active', combatKind: 'attack', kind: 'instant' }],
    maxLevel: 30,
    isAscent: true,
  },
} as const satisfies Record<HeroSkillName, SkillMeta<HeroSkillName>>;

export type HeroAttackSkillName = AttackSkillNameFromSkillMeta<typeof heroSkillMeta>;
export type HeroActiveSkillName = ActiveSkillNameFromSkillMeta<typeof heroSkillMeta>;
