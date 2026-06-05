import type { ClassSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const paladinSkills = {
  link: ['인빈서블 빌리프'],
  zero: {
    commonGroup: ['all', 'adventurer'],
  },
  first: {
    active: ['슬래시 블러스트', '워리어 리프', '리프 어택'],
    passive: ['아이언 바디', '워리어 마스터리'],
  },
  second: {
    active: ['디바인 스윙', '페이지 오더'],
    passive: ['홀리 차지', '웨폰 액셀레이션', '스탠스', '웨폰 마스터리', '파이널 어택', '피지컬 트레이닝'],
  },
  third: {
    active: ['디바인 차지', '리스토네이션', '돌진', '노블 디맨드', '컴뱃 오더스'],
    passive: ['파라쇼크 가드', '실드 마스터리', '아킬레스', '블레싱 아머'],
  },
  fourth: {
    active: ['블래스트', '매직 크래쉬', '생츄어리', '디바인 블레싱', '메이플 용사', '용사의 의지', '가디언 스피릿'],
    passive: ['디바인 스티그마', '디바인 저지먼트', '메이플 용사', '팔라딘 엑스퍼트', '어드밴스드 홀리 차지'],
    internalSkills: ['디바인 스티그마-성흔폭발'],
    linkedGroups: [['디바인 스티그마', '디바인 스티그마-성흔폭발']],
    derivedGroups: [
      {
        source: '디바인 차지',
        condition: {
          intervalSec: 7,
          kind: 'replace',
        },
        skills: ['디바인 스티그마'],
      },
      {
        source: '디바인 스티그마',
        skills: ['디바인 스티그마-성흔폭발'],
      },
      {
        source: '블래스트',
        skills: ['디바인 저지먼트'],
      },
    ],
  },
  hyper: {
    passive: [
      '디바인 차지-리인포스',
      '디바인 차지-크리티컬 레이트',
      '디바인 차지-보너스 어택',
      '블래스트-리인포스',
      '블래스트-크리티컬 레이트',
      '블래스트-보너스 어택',
      '생츄어리-리인포스',
      '생츄어리-쿨타임 리듀스',
      '생츄어리-보너스 어택',
    ],
    active: ['새크로생티티', '스마이트', '에픽 어드벤쳐'],
  },
  fifth: {
    classActive: ['홀리 유니티', '블래스드 해머', '그랜드 크로스', '마이티 묠니르'],
    internalSkills: ['홀리 유니티-결속', '블래스트-결속', '디바인 차지-결속', '생츄어리-결속', '디바인 스티그마-결속'],
    enhancement: [
      '블래스트 강화',
      '디바인 저지먼트 강화',
      '디바인 차지 강화',
      '디바인 스티그마 강화',
      '생츄어리 강화',
      '파이널 어택 강화',
      '스마이트 강화',
      '리프 어택 강화',
      '돌진 강화',
      '디바인 스윙 강화',
      '페이지 오더 강화',
    ],
    commonGroup: ['all', 'adventurer', 'warrior'],
    linkedGroups: [
      ['홀리 유니티', '홀리 유니티-결속'],
      ['블래스트 강화', '디바인 저지먼트 강화'],
      ['디바인 차지 강화', '디바인 스티그마 강화'],
      ['파이널 어택 강화', '스마이트 강화'],
      ['리프 어택 강화', '돌진 강화'],
      ['디바인 스윙 강화', '페이지 오더 강화'],
    ],
    derivedGroups: [
      {
        source: '홀리 유니티',
        skills: ['홀리 유니티-결속'],
      },
      {
        source: '블래스트',
        condition: {
          requiredSkillState: '홀리 유니티-결속',
        },
        skills: ['블래스트-결속'],
      },
      {
        source: '디바인 차지',
        condition: {
          requiredSkillState: '홀리 유니티-결속',
        },
        skills: ['디바인 차지-결속'],
      },
      {
        source: '디바인 스티그마',
        condition: {
          requiredSkillState: '홀리 유니티-결속',
        },
        skills: ['디바인 스티그마-결속'],
      },
      {
        source: '생츄어리',
        condition: {
          requiredSkillState: '홀리 유니티-결속',
        },
        skills: ['생츄어리-결속'],
      },
    ],
  },
  sixth: {
    mastery: ['블래스트 VI', '디바인 저지먼트 VI', '디바인 차지 VI', '디바인 스티그마 VI', '폴링 저스티스', '생츄어리 VI', '파이널 어택 VI', '라이징 저스티스'],
    enhancement: ['홀리 유니티 강화', '블래스드 해머 강화', '그랜드 크로스 강화', '마이티 묠니르 강화'],
    classActive: ['세이크리드 바스티온', '도미누스 오브리온'],
    commonGroup: ['all', 'adventurer', 'warrior'],
    internalSkills: ['블래스트 VI-결속', '디바인 차지 VI-결속', '생츄어리-결속', '디바인 스티그마 VI-결속'],
    linkedGroups: [
      ['디바인 차지 VI', '디바인 스티그마 VI', '폴링 저스티스'],
      ['블래스트 VI', '디바인 저지먼트 VI'],
      ['파이널 어택 VI', '라이징 저스티스'],
    ],
    derivedGroups: [
      {
        source: ['블래스트 VI', '세이크리드 바스티온', '생츄어리 VI'],
        skills: ['디바인 저지먼트 VI'],
      },
      {
        source: '디바인 차지 VI',
        condition: {
          intervalSec: 6,
          kind: 'replace',
        },
        skills: ['디바인 스티그마 VI'],
      },
      {
        source: '디바인 차지 VI',
        condition: {
          requiredSkillState: '홀리 유니티-결속',
        },
        skills: ['디바인 차지 VI-결속'],
      },
      {
        source: '디바인 스티그마 VI',
        condition: {
          requiredSkillState: '홀리 유니티-결속',
        },
        skills: ['디바인 스티그마 VI-결속'],
      },
      {
        source: '블래스트 VI',
        condition: {
          requiredSkillState: '홀리 유니티-결속',
        },
        skills: ['블래스트 VI-결속'],
      },
      {
        source: '생츄어리 VI',
        condition: {
          requiredSkillState: '홀리 유니티-결속',
        },
        skills: ['생츄어리 VI-결속'],
      },
      {
        source: '폴링 저스티스',
        skills: ['라이징 저스티스'],
      },
    ],
  },
} as const satisfies ClassSkillSet;

export type PaladinSkillName = SkillNameFromSkillSet<typeof paladinSkills>;
