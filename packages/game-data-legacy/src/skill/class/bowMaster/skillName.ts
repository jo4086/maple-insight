import type { ClassSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const bowMasterSkills = {
  link: ['어드벤쳐러 큐리어스'],

  zero: {
    active: [],
    passive: [],
    commonGroup: ['adventurer', 'all'],
  },

  first: {
    active: ['애로우 블로우', '더블 점프'],
    passive: ['크리티컬 샷', '아처 마스터리'],
  },

  second: {
    active: ['바람의 시', '리트리트 샷', '스위프트 서지', '퀴버 카트리지'],
    passive: ['보우 액셀레이션', '소울 애로우 : 활', '보우 마스터리', '파이널 어택 : 활', '피지컬 트레이닝'],
    internalSkills: ['퀴버 카트리지-마법 화살'],
    derivedGroups: [
      {
        source: '퀴버 카트리지',
        skills: ['퀴버 카트리지-마법 화살'],
      },
    ],
  },

  third: {
    active: ['애로우 플래터', '플레시 미라주', '피닉스', '제피르 배리어', '퀴버 플로우'],
    passive: ['익스트림 아쳐리 : 활', '모탈 블로우', '컨센트레이션', '닷지', '마크맨쉽'],
    internalSkills: ['플레시 미라주-잔영', '애로우 플래터-설치'],
  },

  fourth: {
    active: ['폭풍의 시', '언카운터블 애로우', '샤프 아이즈', '메이플 용사', '용사의 의지'],
    passive: ['플레시 미라주 II', '어드밴스드 퀴버', '보우 엑스퍼트', '일루전 스탭', '어드밴스드 파이널 어택', '아머 피어싱'],
    internalSkills: ['퀴버 카트리지-흡혈 화살'],
    derivedGroups: [
      {
        source: '퀴버 카트리지',
        skills: ['퀴버 카트리지-흡혈 화살'],
        condition: {
          requiredSkillState: '어드밴스드 퀴버',
        },
      },
    ],
  },

  hyper: {
    passive: [
      '샤프 아이즈-퍼시스트',
      '샤프 아이즈-이그노어 가드',
      '샤프 아이즈-크리티컬 레이트',
      '언카운터블 애로우-리인포스',
      '언카운터블 애로우-엑스트라 타겟',
      '언카운터블 애로우-보너스 어택',
      '폭풍의 시-리인포스',
      '폭풍의 시-보스 킬러',
      '폭풍의 시-스플릿 어택',
    ],
    active: ['프리퍼레이션', '윈드 오브 프레이', '에픽 어드벤쳐'],
  },

  fifth: {
    classActive: ['애로우 레인', '잔영의 시', '퀴버 풀버스트', '실루엣 미라주'],
    enhancement: [
      '폭풍의 시 강화',
      '파이널 어택 : 활 강화',
      '애로우 플래터 강화',
      '언카운터블 애로우 강화',
      '퀴버 카트리지 강화',
      '피닉스 강화',
      '윈드 오브 프레이 강화',
      '플레시 미라주 강화',
      '리트리트 샷 강화',
      '스위프트 서지 강화',
      '바람의 시 강화',
      '애로우 블로우 강화',
    ],
    internalSkills: ['퀴버 풀버스트-화염 화살', '잔영의 시-잔영', '애로우 레인-영역'],
    linkedGroups: [
      {
        name: '폭풍의 시/파이널 어택 : 활 강화',
        skills: ['폭풍의 시 강화', '파이널 어택 : 활 강화'],
      },
      {
        name: '애로우 플래터/언카운터블 애로우 강화',
        skills: ['애로우 플래터 강화', '언카운터블 애로우 강화'],
      },
      {
        name: '퀴버 카트리지/피닉스 강화',
        skills: ['퀴버 카트리지 강화', '피닉스 강화'],
      },
      {
        name: '윈드 오브 프레이/플레시 미라주 강화',
        skills: ['윈드 오브 프레이 강화', '플레시 미라주 강화'],
      },
      {
        name: '리트리트 샷/스위프트 서지 강화',
        skills: ['리트리트 샷 강화', '스위프트 서지 강화'],
      },
      {
        name: '바람의 시/애로우 블로우 강화',
        skills: ['바람의 시 강화', '애로우 블로우 강화'],
      },
    ],
    derivedGroups: [
      {
        source: '애로우 레인',
        skills: ['애로우 레인-영역'],
      },
      {
        source: '퀴버 풀버스트',
        skills: ['퀴버 풀버스트-화염 화살'],
      },
      {
        source: '잔영의 시',
        skills: ['잔영의 시-잔영'],
      },
    ],
    commonGroup: ['all', 'adventurer', 'archer'],
  },

  sixth: {
    mastery: ['폭풍의 시 VI', '애로우 플래터 VI', '언카운터블 애로우 VI', '퀴버 카트리지 VI', '피닉스 VI', '엑스트라 퀴버 카트리지', '플레시 미라주 VI', '윈드 오브 프레이 VI'],
    enhancement: ['애로우 레인 강화', '잔영의 시 강화', '퀴버 풀버스트 강화', '실루엣 미라주 강화'],
    classActive: ['어센던트 셰이드', '포인트 제로'],
    internalSkills: [
      '폭풍의 시 VI-난사',
      '애로우 플래터 VI-설치',
      '강화 언카운터블 애로우 VI',
      '퀴버 카트리지 VI-마법 화살',
      '퀴버 카트리지 VI-흡혈 화살',
      '엑스트라 퀴버 카트리지-마법 화살',
      '엑스트라 퀴버 카트리지-흡혈 화살',
      '플레시 미라주 VI-잔영',

      '어센던트 셰이드-화살 세례',
      '포인트 제로-화살 충격',
      '포인트 제로-일점 폭발',
    ],
    linkedGroups: [
      {
        name: '애로우 플래터 VI / 언카운터블 애로우 VI',
        skills: ['애로우 플래터 VI', '언카운터블 애로우 VI'],
      },
      {
        name: '퀴버 카트리지 VI / 피닉스 VI',
        skills: ['퀴버 카트리지 VI', '피닉스 VI', '엑스트라 퀴버 카트리지'],
      },
      {
        name: '플레시 미라주 VI / 윈드 오브 프레이 VI',
        skills: ['플레시 미라주 VI', '윈드 오브 프레이 VI'],
      },
    ],
    derivedGroups: [
      {
        source: '폭풍의 시 VI',
        skills: ['폭풍의 시 VI-난사'],
      },
      {
        source: '애로우 플래터 VI',
        skills: ['애로우 플래터 VI-설치'],
      },
      {
        source: '퀴버 카트리지 VI',
        skills: ['퀴버 카트리지 VI-마법 화살', '퀴버 카트리지 VI-흡혈 화살'],
      },
      {
        source: '엑스트라 퀴버 카트리지',
        skills: ['엑스트라 퀴버 카트리지-마법 화살', '엑스트라 퀴버 카트리지-흡혈 화살'],
      },
      {
        source: '플레시 미라주 VI',
        skills: ['플레시 미라주 VI-잔영'],
      },
      {
        source: '어센던트 셰이드',
        skills: ['어센던트 셰이드-화살 세례'],
      },
      {
        source: '포인트 제로',
        skills: ['포인트 제로-화살 충격'],
      },
      {
        source: '포인트 제로-화살 충격',
        skills: ['포인트 제로-일점 폭발'],
      },
      {
        source: '언카운터블 애로우 VI',
        skills: ['강화 언카운터블 애로우 VI'],
      },
    ],
    commonGroup: ['all', 'adventurer', 'archer'],
  },
} as const satisfies ClassSkillSet;

export type BowMasterSkillName = SkillNameFromSkillSet<typeof bowMasterSkills>;
