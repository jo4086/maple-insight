import type { BowMasterSkillName } from './skillName';

import { meta, vmatrixEnhanceCore, hexamatrixEnhanceCore, hyperPassiveSkill } from '@/skill/types';

import type { ActiveSkillNameFromSkillMeta, AttackSkillNameFromSkillMeta, SkillMeta } from '@/skill/types';

const m = meta.of<BowMasterSkillName>();

export const bowMasterSkillMeta = {
  '어드벤쳐러 큐리어스': m.level(2, {
    effects: ['passiveStat'],
  }),

  '애로우 블로우': m.level(20, {
    effects: ['activeAttackInstant'],
  }),
  '더블 점프': m.level(10, {
    effects: ['activeMovement'],
  }),
  '크리티컬 샷': m.level(20, {
    effects: ['passiveStat'],
  }),
  '아처 마스터리': m.level(15, {
    effects: ['passiveStat'],
  }),

  '바람의 시': m.level(20, {
    effects: ['activeAttackInstant'],
  }),
  '리트리트 샷': m.level(9, {
    effects: ['activeAttackKeyDown'],
  }),
  '스위프트 서지': m.level(4, {
    effects: ['activeMovement', 'activeAttackInstant'],
  }),
  '퀴버 카트리지': m.level(1, {
    initialLevel: 1,
    effects: ['activeToggle'],
  }),
  '퀴버 카트리지-마법 화살': m.level('퀴버 카트리지', {
    isInternal: true,
    effects: ['passiveAttackTriggered', 'passiveAttackProjectile'],
  }),
  '보우 액셀레이션': m.level(10, {
    effects: ['passiveStat'],
    requiredSkill: [{ name: '보우 마스터리', level: 5 }],
  }),
  '소울 애로우 : 활': m.level(10, {
    effects: ['passiveStat'],
  }),
  '보우 마스터리': m.level(10, {
    effects: ['passiveStat'],
  }),
  '파이널 어택 : 활': m.level(20, {
    effects: ['passiveFinalAttack'],
    requiredSkill: [{ name: '보우 마스터리', level: 3 }],
  }),
  '피지컬 트레이닝': m.level(5, {
    effects: ['passiveStat'],
  }),

  // 3차 스킬
  '애로우 플래터': m.level(20, {
    effects: ['activeAttackKeyDown'],
  }),
  '애로우 플래터-설치': m.level('애로우 플래터', {
    isInternal: true,
    effects: ['activeAttackSummon'],
  }),
  '플레시 미라주': m.level(20, {
    effects: ['activeToggle', 'passiveSkillEnhance'],
  }),
  '플레시 미라주-잔영': m.level('플레시 미라주', {
    isInternal: true,
    effects: ['passiveAttackTriggered'],
    tags: ['플래시 미라주: 잔영'],
  }),
  피닉스: m.level(10, {
    effects: ['passiveStat', 'activeAttackSummon'],
  }),
  '제피르 배리어': m.level(10, {
    effects: ['activeBuff'],
  }),
  '퀴버 플로우': m.level(10, {
    effects: ['activeMovement'],
  }),
  '익스트림 아쳐리 : 활': m.level(10, {
    effects: ['passiveStat'],
  }),
  '모탈 블로우': m.level(10, {
    effects: ['passiveStat'],
  }),
  컨센트레이션: m.level(20, {
    effects: ['passiveStat'],
  }),
  닷지: m.level(4, {
    effects: ['passiveStat'],
  }),
  마크맨쉽: m.level(10, {
    effects: ['passiveStat'],
  }),

  // 4차 스킬
  '폭풍의 시': m.level(30, {
    isCombatOrders: true,
    effects: ['activeAttackKeyDown', 'passiveSkillEnhance'],
  }),
  '언카운터블 애로우': m.level(30, {
    isCombatOrders: true,
    effects: ['activeAttackInstant'],
  }),
  '플레시 미라주 II': m.level(20, {
    isCombatOrders: true,
    effects: ['passiveSkillEnhance'],
  }),
  '어드밴스드 퀴버': m.level(10, {
    effects: ['passiveStat', 'passiveSkillEnhance'],
  }),
  '퀴버 카트리지-흡혈 화살': m.level('어드밴스드 퀴버', {
    isInternal: true,
    effects: ['passiveHeal', 'passiveAttackTriggered', 'passiveAttackProjectile'],
  }),
  '샤프 아이즈': m.level(30, {
    isCombatOrders: true,
    effects: ['activeBuff'],
  }),
  '메이플 용사': m.level(30, {
    isCombatOrders: true,
    effects: ['passiveStat', { activation: 'active', combatKind: 'nonAttack', kind: 'effect' }],
  }),
  '용사의 의지': m.level(5, {
    effects: ['activeBuff'],
  }),
  '보우 엑스퍼트': m.level(30, {
    isCombatOrders: true,
    effects: ['passiveStat'],
  }),
  '일루전 스탭': m.level(30, {
    isCombatOrders: true,
    effects: ['passiveStat'],
  }),
  '어드밴스드 파이널 어택': m.level(30, {
    isCombatOrders: true,
    effects: ['passiveStat', 'passiveFinalAttack'],
  }),
  '아머 피어싱': m.level(10, {
    isCombatOrders: true,
    effects: ['passiveStat'],
  }),
  '샤프 아이즈-퍼시스트': hyperPassiveSkill,
  '샤프 아이즈-이그노어 가드': hyperPassiveSkill,
  '샤프 아이즈-크리티컬 레이트': hyperPassiveSkill,
  '언카운터블 애로우-리인포스': hyperPassiveSkill,
  '언카운터블 애로우-엑스트라 타겟': hyperPassiveSkill,
  '언카운터블 애로우-보너스 어택': hyperPassiveSkill,
  '폭풍의 시-리인포스': hyperPassiveSkill,
  '폭풍의 시-보스 킬러': hyperPassiveSkill,
  '폭풍의 시-스플릿 어택': hyperPassiveSkill,
  프리퍼레이션: m.level(1, {
    effects: ['activeBuff'],
  }),
  '윈드 오브 프레이': m.level(1, {
    effects: ['passiveSkillEnhance', 'activeAttackInstant', 'activeDebuff'],
  }),
  '에픽 어드벤쳐': m.level(1, {
    tags: ['adventurer'],
    effects: ['activeBuff'],
  }),

  // 5차 스킬
  '애로우 레인': m.level(30, {
    effects: ['activeBuff'],
  }),
  '애로우 레인-영역': m.level('애로우 레인', {
    isInternal: true,
    effects: ['passiveAttackTriggered', 'passiveAttackSummon', 'passiveSkillEnhance'],
  }),
  '잔영의 시': m.level(30, {
    effects: ['activeBuff', 'passiveTrigger'],
  }),
  '잔영의 시-잔영': m.level('잔영의 시', {
    isInternal: true,
    effects: ['passiveAttackTriggered', 'passiveAttackProjectile'],
  }),
  '퀴버 풀버스트': m.level(30, {
    effects: ['activeBuff'],
  }),
  '퀴버 풀버스트-화염 화살': m.level('퀴버 풀버스트', {
    isInternal: true,
    effects: ['passiveAttackTriggered', 'passiveAttackProjectile'],
  }),
} as const satisfies Record<BowMasterSkillName, SkillMeta<BowMasterSkillName>>;

export type BowMasterAttackSkillName = AttackSkillNameFromSkillMeta<typeof bowMasterSkillMeta>;
export type BowMasterActiveSkillName = ActiveSkillNameFromSkillMeta<typeof bowMasterSkillMeta>;
