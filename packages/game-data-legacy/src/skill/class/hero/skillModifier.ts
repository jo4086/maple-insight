import type { HeroSkillName } from './skillName';

import { skillFormula, type SkillModifierTable } from '@/skill/types';

const enhancementDamageMultiplier = (perLevelPercent: number) => skillFormula.level(perLevelPercent / 100, { base: 1 });

export const heroSkillModifier = {
  '어드밴스드 콤보': [
    {
      type: 'modifier',
      targetSkill: '콤보 어택',
      targetField: 'stackMax',
      operation: 'override',
      value: 10,
    },
    {
      type: 'modifier',
      targetSkill: '콤보 시너지',
      targetField: 'amount',
      operation: 'add',
      value: 5,
    },
  ],
  '어드밴스드 콤보-리인포스': [
    {
      type: 'modifier',
      targetSkill: '콤보 시너지',
      targetField: 'amount',
      operation: 'add',
      value: 2,
    },
  ],
  '어드밴스드 파이널 어택-리인포스': [
    {
      type: 'modifier',
      targetSkill: ['파이널 어택', '어드밴스드 파이널 어택', '파이널 어택 VI'],
      targetField: 'attackStat',
      targetStat: 'damage',
      operation: 'add',
      value: 10,
    },
  ],
  '어드밴스드 파이널 어택-보너스 데미지': [
    {
      type: 'modifier',
      targetSkill: '어드밴스드 파이널 어택',
      targetField: 'amount',
      targetStat: 'attackPower',
      operation: 'add',
      value: 20,
    },
  ],
  '어드밴스드 파이널 어택-보너스 찬스': [
    {
      type: 'modifier',
      targetSkill: ['어드밴스드 파이널 어택', '파이널 어택 VI'],
      targetField: 'chancePercent',
      operation: 'add',
      value: 15,
    },
  ],
  '레이징 블로우-리인포스': [
    {
      type: 'modifier',
      targetSkill: ['레이징 블로우', '강화 레이징 블로우', '레이징 블로우 VI', '강화 레이징 블로우 VI'],
      targetField: 'attackStat',
      targetStat: 'damage',
      operation: 'add',
      value: 20,
    },
  ],
  '레이징 블로우-엑스트라 타겟': [
    {
      type: 'modifier',
      targetSkill: ['레이징 블로우', '강화 레이징 블로우', '레이징 블로우 VI', '강화 레이징 블로우 VI'],
      targetField: 'maxTargets',
      operation: 'add',
      value: 2,
    },
  ],
  '레이징 블로우-보너스 어택': [
    {
      type: 'modifier',
      targetSkill: ['레이징 블로우', '강화 레이징 블로우', '레이징 블로우 VI', '강화 레이징 블로우 VI'],
      targetField: 'hitCount',
      operation: 'add',
      value: 1,
    },
  ],
  '콤보 인스팅트': [
    {
      type: 'modifier',
      targetSkill: '콤보 어택',
      targetField: 'amount',
      targetStat: 'attackPower',
      operation: 'addRate',
      value: 0.11,
    },
    {
      type: 'modifier',
      targetSkill: '콤보 시너지',
      targetField: 'amount',
      targetStat: 'finalDamage',
      operation: 'addRate',
      value: 0.11,
    },
    {
      type: 'modifier',
      targetSkill: '어드밴스드 콤보-보스 킬러',
      targetField: 'amount',
      targetStat: 'bossDamage',
      operation: 'addRate',
      value: 0.11,
    },
    {
      type: 'modifier',
      targetSkill: '소드 일루전',
      targetField: 'amount',
      targetStat: 'finalDamage',
      operation: 'addRate',
      value: 0.11,
    },
  ],
  '레이지 업라이징 VI': [
    {
      type: 'modifier',
      targetSkill: ['레이징 블로우 VI', '강화 레이징 블로우 VI'],
      targetField: 'damagePercent',
      operation: 'add',
      value: skillFormula.level(4, { base: 37 }),
    },
  ],
  '레이징 블로우 강화': [
    {
      type: 'modifier',
      targetSkill: ['레이징 블로우', '강화 레이징 블로우', '레이징 블로우 VI', '강화 레이징 블로우 VI'],
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(2),
    },
  ],
  '레이지 업라이징 강화': [
    {
      type: 'modifier',
      targetSkill: ['레이지 업라이징', '레이지 업라이징 VI'],
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(2),
    },
  ],
  '오라 블레이드 강화': [
    {
      type: 'modifier',
      targetSkill: ['오라 블레이드', '오라 블레이드 VI', '파이널 블레이드', '퓨리어스 엣지'],
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(3),
    },
  ],
  '발할라 강화': [
    {
      type: 'modifier',
      targetSkill: ['발할라', '발할라 VI'],
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(2),
    },
  ],
  '인사이징 강화': [
    {
      type: 'modifier',
      targetSkill: ['인사이징', '인사이징 VI'],
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(2),
    },
  ],
  '파이널 어택 강화': [
    {
      type: 'modifier',
      targetSkill: ['파이널 어택', '어드밴스드 파이널 어택', '파이널 어택 VI'],
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(2),
    },
  ],
  '리프 어택 강화': [
    {
      type: 'modifier',
      targetSkill: '리프 어택',
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(3),
    },
  ],
  '돌진 강화': [
    {
      type: 'modifier',
      targetSkill: '돌진',
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(3),
    },
  ],
  '플래시 슬래시 강화': [
    {
      type: 'modifier',
      targetSkill: '플래시 슬래시',
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(5),
    },
  ],
  '브랜디쉬 강화': [
    {
      type: 'modifier',
      targetSkill: '브랜디쉬',
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(5),
    },
  ],
  '브레이브 슬래시 강화': [
    {
      type: 'modifier',
      targetSkill: '브레이브 슬래시',
      targetField: 'damagePercent',
      operation: 'multiply',
      value: enhancementDamageMultiplier(3),
    },
  ],
} as const satisfies SkillModifierTable<HeroSkillName>;
