import type { DualBladeSkillSet } from '../types';

export const dualBladeSkills = {
  link: ['시프 커닝'],
  zero: {
    active: ['재귀'],
    commonGroup: ['adventurer', 'all'],
  },
  first: {
    active: ['샤프 슬래시', '플래시 점프', '다크 사이트'],
    passive: ['사이드 스텝'],
  },
  firstPlus: {
    active: ['토네이도 스핀'],
    passive: ['샤프 슬래시 강화', '이도류 마스터리', '셀프 헤이스트', '세미듀어러 어질리티'],
  },
  second: {
    active: ['페이탈 블로우', '슬래시 스톰'],
    passive: ['이도 액셀레이션', '카르마', '피지컬 트레이닝'],
  },
  secondPlus: {
    active: ['플라잉 어썰터'],
    passive: ['슬래시 스톰 강화', '플래시 뱅', '베놈'],
  },
  third: {
    active: ['블러디 스톰', '블레이드 어센션', '사슬지옥', '미러 이미징'],
    passive: ['블러디 스톰', '어드밴스 다크 사이트', '바이탈 스틸', '래디컬 다크니스', '섀도우 이베이젼'],
  },
  fourth: {
    active: ['블레이드 퓨리', '팬텀 블로우', '파이널 컷', '써든 레이드', '메이플 용사', '용사의 의지', '더미 이펙트'],
    passive: ['메이플 용사', '더미 이펙트', '쏜즈 이펙트', '샤프니스', '페이탈 베놈', '이도류 엑스퍼트'],
  },
  hyper: {
    active: ['히든 블레이드', '아수라', '에픽 어드벤쳐'],
    passive: [
      '블레이드 퓨리-리인포스',
      '블레이드 퓨리-이그노어 가드',
      '블레이드 퓨리-엑스트라 타겟',
      '팬텀 블로우-리인포스',
      '팬텀 블로우-이그노어 가드',
      '팬텀 블로우-보너스 어택',
      '블레이드 어센션-이그노어 가드',
      '블레이드 어센션-리인포스',
      '블레이드 어센션-보너스 어택',
    ],
  },
  fifth: {
    classActive: ['블레이드 스톰', '카르마 퓨리', '블레이드 토네이도', '헌티드 엣지'],
    enhancement: [
      '팬텀 블로우/파이널 컷 강화',
      '아수라 강화',
      '히든 블레이드 강화',
      '블레이드 퓨리/써든레이드 강화',
      '플라잉 어썰터/블러디 스톰/사슬지옥/블레이드 어센션 강화',
      '샤프 슬래시/토네이도 스핀/페이탈 블로우/슬래시 스톰 강화',
    ],
    commonGroup: ['thief', 'adventurer', 'all'],
  },
  sixth: {
    classActive: ['카르마 블레이드', '야마즈 디크리'],
    mastery: ['팬텀 블로우 VI', '아수라 VI', '히든 블레이드 VI/생자필멸', '블레이드 퓨리 VI/써든레이드 VI'],
    enhancement: ['블레이드 스톰 강화', '카르마 퓨리 강화', '블레이드 토네이도 강화', '헌티드 엣지 강화'],
    commonGroup: ['all', 'thief', 'adventurer'],
  },
} as const satisfies DualBladeSkillSet;
