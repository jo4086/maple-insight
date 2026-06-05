import type { ClassSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const heroSkills = {
  link: ['인빈서블 빌리프'],
  zero: {
    active: [],
    passive: [],
    commonGroup: ['all'],
  },
  first: {
    active: ['슬래시 블러스트', '워리어 리프', '리프 어택'],
    passive: ['아이언 바디', '워리어 마스터리'],
  },
  second: {
    active: ['브랜디쉬', '플래시 슬래시', '콤보 어택', '스피릿 블레이드'],
    passive: ['웨폰 마스터리', '파이널 어택', '피지컬 트레이닝', '웨폰 액셀레이션'],
  },
  third: {
    active: ['브레이브 슬래시', '오라 블레이드', '돌진', '스카링 소드'],
    passive: ['콤보 시너지', '셀프 리커버리', '찬스 어택', '인듀어'],
  },
  fourth: {
    active: ['레이징 블로우', '인사이징', '매직 크래쉬', '메이플 용사', '용사의 의지', '강화 레이징 블로우'],
    passive: ['어드밴스드 콤보', '컴뱃 마스터리', '스탠스', '어드밴스드 파이널 어택', '인레이지', '메이플 용사'],
    derivedGroups: [
      {
        source: '레이징 블로우',
        skills: ['강화 레이징 블로우'],
      },
    ],
  },
  hyper: {
    passive: [
      '어드밴스드 콤보-리인포스',
      '어드밴스드 콤보-보너스 찬스',
      '어드밴스드 콤보-보스 킬러',
      '어드밴스드 파이널 어택-리인포스',
      '어드밴스드 파이널 어택-보너스 데미지',
      '어드밴스드 파이널 어택-보너스 찬스',
      '레이징 블로우-리인포스',
      '레이징 블로우-엑스트라 타겟',
      '레이징 블로우-보너스 어택',
    ],
    active: ['발할라', '레이지 업라이징', '에픽 어드벤쳐'],
  },
  fifth: {
    classActive: ['소드 오브 버닝 소울', '콤보 데스폴트', '콤보 인스팅트', '소드 일루전', '소드 오브 버닝 소울-일반', '소드 오브 버닝 소울-고정', '공간의 상처', '영혼의 잔흔'],
    enhancement: [
      '레이징 블로우 강화',
      '레이지 업라이징 강화',
      '오라 블레이드 강화',
      '발할라 강화',
      '인사이징 강화',
      '파이널 어택 강화',
      '리프 어택 강화',
      '돌진 강화',
      '플래시 슬래시 강화',
      '브랜디쉬 강화',
      '브레이브 슬래시 강화',
    ],
    commonGroup: ['all', 'warrior', 'adventurer'],
    linkedGroups: [
      ['발할라 강화', '인사이징 강화', '파이널 어택 강화'],
      ['리프 어택 강화', '돌진 강화', '플래시 슬래시 강화'],
      ['브랜디쉬 강화', '브레이브 슬래시 강화'],
    ],
    derivedGroups: [
      {
        source: '소드 오브 버닝 소울',
        skills: ['소드 오브 버닝 소울-일반', '소드 오브 버닝 소울-고정'],
      },
      {
        source: '콤보 인스팅트',
        skills: ['공간의 상처', '영혼의 잔흔'],
      },
    ],
  },
  sixth: {
    mastery: [
      '레이징 블로우 VI',
      '레이지 업라이징 VI',
      '오라 블레이드 VI',
      '퓨리어스 엣지',
      '발할라 VI',
      '인사이징 VI',
      '파이널 어택 VI',
      '강화 레이징 블로우 VI',
      '파이널 블레이드',
    ],
    enhancement: ['소드 오브 버닝 소울 강화', '콤보 데스폴트 강화', '콤보 인스팅트 강화', '소드 일루전 강화'],
    classActive: ['스피릿 칼리버', '사일런트 클리브'],
    commonGroup: ['all', 'warrior', 'adventurer'],
    linkedGroups: [
      ['오라 블레이드 VI', '퓨리어스 엣지'],
      ['발할라 VI', '인사이징 VI', '파이널 어택 VI'],
    ],
    derivedGroups: [
      {
        source: '오라 블레이드 VI',
        skills: ['퓨리어스 엣지'],
      },
      {
        source: '레이징 블로우 VI',
        skills: ['강화 레이징 블로우 VI'],
      },
      {
        source: '오라 블레이드 VI',
        skills: ['파이널 블레이드'],
      },
    ],
  },
} as const satisfies ClassSkillSet;

export type HeroSkillName = SkillNameFromSkillSet<typeof heroSkills>;
