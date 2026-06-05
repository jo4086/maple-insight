import type { HeroSkillName } from './skillName';

import type { SkillDelayTable } from '@/skill/types';

export const heroSkillDelay = {
  브랜디쉬: {
    type: 'fixed',
    delayMs: 780,
  },
  '플래시 슬래시': {
    type: 'fixed',
    delayMs: 630,
  },
  '브레이브 슬래시': {
    type: 'fixed',
    delayMs: 810,
  },
  '오라 블레이드': {
    type: 'fixed',
    delayMs: 660,
  },
  돌진: {
    type: 'fixed',
    delayMs: 480,
  },
  '레이징 블로우': {
    type: 'fixed',
    delayMs: 660,
  },
  '강화 레이징 블로우': {
    type: 'fixed',
    delayMs: 660,
  },
  '레이징 블로우 VI': {
    type: 'fixed',
    delayMs: 660,
  },
  '강화 레이징 블로우 VI': {
    type: 'fixed',
    delayMs: 660,
  },
  인사이징: {
    type: 'fixed',
    delayMs: 720,
  },
  '인사이징 VI': {
    type: 'fixed',
    delayMs: 720,
  },
  '소드 일루전': {
    type: 'fixed',
    delayMs: 660,
  },
  '레이지 업라이징': {
    type: 'fixed',
    delayMs: 660,
  },
  '레이지 업라이징 VI': {
    type: 'fixed',
    delayMs: 660,
  },
  '콤보 데스폴트': {
    type: 'fixed',
    delayMs: 1680,
  },
  '스피릿 칼리버': {
    type: 'fixed',
    delayMs: 7080,
  },
  '사일런트 클리브': {
    type: 'fixed',
    delayMs: 2400,
  },
} as const satisfies SkillDelayTable<HeroSkillName>;
