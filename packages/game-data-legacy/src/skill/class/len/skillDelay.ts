import type { LenActiveSkillName } from './skillMeta';

import type { SkillDelayTable } from '@/skill/types';

export const lenSkillDelay = {
  '매화검 본초 : 참': {
    type: 'fixed',
    delayMs: 660,
  },
  '매화검 본초 : 자': {
    type: 'fixed',
    delayMs: 720,
  },
  '매화검 1초식 : 순인': {
    type: 'fixed',
    delayMs: 90,
  },
  '매화검 1초식 : 순인-발검': {
    type: 'fixed',
    delayMs: 90,
  },
  '매화검 1초식 : 순인-납검': {
    type: 'fixed',
    delayMs: 120,
  },
  '매화검 본초 : 천': {
    type: 'fixed',
    delayMs: 720,
  },
  '망혼검 절기 : 열지': {
    type: 'fixed',
    delayMs: 660,
  },
  '매화검 4초식 : 영인': {
    type: 'fixed',
    delayMs: 720,
  },
  '매화검 3초식 : 예인': {
    type: 'fixed',
    delayMs: 720,
  },
  '매화검 3초식 : 일격예인': {
    type: 'fixed',
    delayMs: 720,
  },
  '망혼검 절기 : 망탄': {
    type: 'fixed',
    delayMs: 660,
  },
  '매화검 5초식 : 천매지박': {
    type: 'fixed',
    delayMs: 720,
  },
  '망혼검 절기 : 무량겁': {
    type: 'fixed',
    delayMs: 660,
  },
  '망혼검 절기 : 심검': {
    type: 'fixed',
    delayMs: 660,
  },
  '창룡파천검 : 승천': {
    type: 'fixed',
    delayMs: 7200,
  },
  '창룡파천검 : 일매낙화 천비인적-낙화': {
    type: 'fixed',
    delayMs: 540,
  },
  '창룡파천검 : 일매낙화 천비인적-진천': {
    type: 'fixed',
    delayMs: 540,
  },
  '창룡파천검 : 일매낙화 천비인적-천강': {
    type: 'fixed',
    delayMs: 2040,
  },
  // '매화검 절기 : 섬무': {
  //   type: 'keyDown',
  //   attacksPerSec: 11.1,
  // },
} as const satisfies SkillDelayTable<LenActiveSkillName>;
