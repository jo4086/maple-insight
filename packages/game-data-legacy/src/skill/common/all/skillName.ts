import type { CommonSkillSet, SkillNameFromSkillSet } from '../../types';

export const allClassSkills = {
  special: {
    active: ['창조의 아이온', '챔피언의 가호'],
    activeToggle: ['파괴의 얄다바오트'],
    passive: [],
  },
  zero: {
    active: ['영웅의 메아리', '익스클루시브 스펠', '인탠시브 타임', '륀느의 가호'],
    passive: ['연합의 의지', '정령의 축복', '여제의 축복'],
  },
  fourth: {
    active: [
      '용사의 의지',
      '데몬즈 윌',
      '시그너스 기사단의 의지',
      '노바 용사의 의지',
      '레프 용사의 의지',
      '아니마 용사의 의지',
      '초월자의 의지',
      '정신 정화',
      '메이플 용사',
      '시그너스 나이츠',
      '노바의 용사',
      '레프의 용사',
      '아니마의 용사',
      '이계의 용사',
    ],
    passive: [],
  },
  fifth: {
    active: [
      '에르다 노바',
      '에르다의 의지',
      '에르다 샤워',
      '블링크',
      '로프 커넥트',
      '쓸만한 미스틱 도어',
      '쓸만한 샤프 아이즈',
      '쓸만한 컴뱃 오더스',
      '쓸만한 하이퍼 바디',
      '쓸만한 홀리 파운틴',
      '쓸만한 홀리 심볼',
      '스파이더 인 미러',
      '크레스트 오브 더 솔라',
    ],
    passive: ['쓸만한 어드밴스드 블레스', '쓸만한 윈드 부스터'],
  },
  sixth: {
    active: ['솔 야누스', '솔 야누스 : 새벽', '솔 야누스 : 황혼', '솔 헤카테', '솔 헤카테 : 스틱스', '솔 헤카테 : 카론', '솔 헤카테 : 플레게톤', '솔 헤카테 : 팩텀'],
    linkedGroups: [
      ['솔 야누스', '솔 야누스 : 새벽', '솔 야누스 : 황혼'],
      ['솔 헤카테', '솔 헤카테 : 스틱스', '솔 헤카테 : 카론', '솔 헤카테 : 플레게톤', '솔 헤카테 : 팩텀'],
    ],
  },
} as const satisfies CommonSkillSet;

export const allClassSkillGroups = {
  echo: ['영웅의 메아리', '익스클루시브 스펠', '인탠시브 타임'],
  will: ['용사의 의지', '데몬즈 윌', '시그너스 기사단의 의지', '노바 용사의 의지', '레프 용사의 의지', '아니마 용사의 의지', '초월자의 의지', '정신 정화'],
  mapleHero: ['메이플 용사', '시그너스 나이츠', '노바의 용사', '레프의 용사', '아니마의 용사', '륀느의 가호', '이계의 용사'],
} as const;

export type AllSkillName = SkillNameFromSkillSet<typeof allClassSkills>;
