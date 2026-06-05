import type { ClassSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const darkNightSkills = {
  link: ['인빈서블 빌리프'],
  zero: {
    active: [],
    passive: [],
    commonGroup: ['all', 'adventurer'],
  },
  first: {
    active: ['슬래시 블러스트', '워리어 리프', '리프 어택'],
    passive: ['아이언 바디', '워리어 마스터리'],
  },
  second: {
    active: ['스피어 풀링', '비홀더', '비홀더 쇼크', '하이퍼 바디'],
    passive: ['아이언 월', '웨폰 마스터리', '웨폰 액셀레이션', '파이널 어택', '피지컬 트레이닝'],
  },
  third: {
    active: ['라만차 스피어', '돌진', '크로스 오버 체인', '비홀더 쇼크 II'],
    passive: ['비홀더 도미넌트', '비홀더스 버프', '로드 오브 다크니스', '인듀어'],
  },
  fourth: {
    active: ['궁니르 디센트', '다크 임페일', '리인카네이션 액셉트', '다크 레조넌스', '매직 크래쉬', '메이플 용사', '용사의 의지', '비홀더 쇼크 III'],
    passive: ['리인카네이션', '리인카네이션-쿼터', '리인카네이션-하프', '리인카네이션-풀', '리인카네이션-알터', '비홀더스 리벤지', '어드밴스드 웨폰 마스터리', '스탠스'],
  },
  hyper: {
    active: ['다크 서스트', '다크 신서시스', '에픽 어드벤쳐'],
    passive: [
      '비홀더-리인포스',
      '비홀더-버프 리인포스',
      '비홀더-힐링 리인포스',
      '리인카네이션-데미지',
      '리인카네이션-리듀스 타겟',
      '리인카네이션-크리티컬 레이트',
      '궁니르 디센트-리인포스',
      '궁니르 디센트-이그노어 가드',
      '궁니르 디센트-보스 킬러',
    ],
  },
  fifth: {
    classActive: ['다크 스피어', '비홀더 임팩트', '피어스 사이클론', '다크니스 오라', '다크니스 오라-피니쉬'],
    enhancement: [
      '궁니르 디센트 강화',
      '다크 임페일 강화',
      '비홀더 강화', // 비홀더 도미넌트, 쇼크, 리벤지, 임팩트 강화
      '다크 신서시스 강화',
      '파이널 어택 강화',
      '리프 어택 강화',
      '돌진 강화',
      '라만차 스피어 강화',
      '스피어 풀링 강화',
    ],
    commonGroup: ['all', 'adventurer', 'warrior'],
    linkedGroups: [
      ['다크 신서시스 강화', '파이널 어택 강화'],
      ['리프 어택 강화', '돌진 강화'],
      ['라만차 스피어 강화', '스피어 풀링 강화'],
    ],
    derivedGroups: [
      {
        source: '다크니스 오라',
        skills: ['다크니스 오라-피니쉬'],
      },
    ],
  },
  sixth: {
    // 다크 임페일 VI가 6초마다 다크 바이던트로 강화함
    classActive: ['데드 스페이스', '다크 헬리덤'],
    mastery: ['궁니르 디센트 VI', '다크 임페일 VI', '다크 바이던트', '다크 신서시스 VI', '비홀더스 리벤지 VI', '비홀더스 피니쉬먼트', '파이널 어택 VI', '비홀더 쇼크 VI'],
    commonGroup: ['all', 'adventurer', 'warrior'],
    enhancement: ['다크 스피어 강화', '비홀더 임팩트 강화', '피어스 사이클론 강화', '다크니스 오라 강화'],
    linkedGroups: [
      ['다크 임페일 VI', '다크 바이던트', '다크 신서시스 VI'],
      ['비홀더스 리벤지 VI', '비홀더스 피니쉬먼트', '파이널 어택 VI'],
    ],
    derivedGroups: [
      {
        source: '비홀더스 리벤지 VI',
        skills: ['비홀더스 피니쉬먼트'],
      },
    ],
  },
} as const satisfies ClassSkillSet;

export type DarkNightSkillName = SkillNameFromSkillSet<typeof darkNightSkills>;
