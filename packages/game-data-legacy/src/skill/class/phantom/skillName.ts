import type { ClassSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const phantomSkills = {
  link: ['데들리 인스팅트'],
  zero: {
    active: ['리턴 오브 팬텀', '팬텀 슈라우드', '스틸 스킬', '스킬 매니지먼트', '저지먼트'],
    activeToggle: ['저지먼트 AUTO/MANUAL'],
    passive: ['하이 덱스터러티'],
    commonGroup: ['all'],
  },
  first: {
    active: ['더블 피어싱', '탤런트 오브 팬텀시프 I', '스위프트 팬텀'],
    passive: ['퀵 이베이젼'],
  },
  second: {
    active: ['콜 오브 페이트', '탤런트 오브 팬텀시프 II', '브리즈 카르트'],
    passive: ['블랑 카르트', '케인 엑셀레이션', '케인 마스터리', '럭 모노폴리'],
  },
  third: {
    active: ['코트 오브 암즈', '팬텀 차지', '탤런트 오브 팬텀시프 III', '럭 오브 팬텀시프', '문 라이트'],
    passive: ['미스포츈 프로텍션', '플래시 앤 플리', '어큐트 센스'],
  },
  fourth: {
    active: ['얼티밋 드라이브', '탤런트 오브 팬텀시프 IV', '템페스트 오브 카드', '트와일라이트', '소울 스틸', '프레이 오브 아리아', '메이플 용사', '용사의 의지'],
    passive: ['느와르 카르트', '케인 엑스퍼트'],
  },
  hyper: {
    passive: [
      '템페스트 오브 카드-리인포스',
      '템페스트 오브 카드-쿨타임 리듀스',
      '템페스트 오브 카드-엑스트라 타겟',
      '얼티밋 드라이브-리인포스',
      '얼티밋 드라이브-엑스트라 타겟',
      '얼티밋 드라이브-이그노어 가드',
      '탤런트 오브 팬텀시프-리인포스',
      '탤런트 오브 팬텀시프-퍼시스트',
      '탤런트 오브 팬텀시프-인핸스',
    ],
    active: ['탤런트 오브 팬텀시프 H', '로즈 카르트 피날레', '히어로즈 오쓰'],
  },
  fifth: {
    classActive: ['조커', '블랙잭', '마크 오브 팬텀', '리프트 브레이크'],
    enhancement: [
      '템페스트 오브 카드 강화',
      '얼티밋 드라이브/코트 오브 암즈/더블 피어싱 강화',
      '블랑 카르트 강화',
      '로즈 카르트 피날레/트와일라이트 강화',
      '팬텀 차지/브리즈 카르트/콜 오브 페이트 강화',
      '탤런트 오브 팬텀 시프 I~IV 강화',
    ],
    commonGroup: ['thief', 'all', 'heroes'],
  },
  sixth: {
    mastery: ['템페스트 오브 카드 VI', '얼티밋 드라이브 VI', '느와르 카르트 VI', '로즈 카르트 피날레 VI', '라모르 카르트'],
    enhancement: ['조커 강화', '블랙잭 강화', '마크 오브 팬텀 강화', '리프트 브레이크 강화'],
    classActive: ['디파잉 페이트', '문리트 세레나데'],
    commonGroup: ['all', 'heroes'],
    linkedGroups: [['로즈 카르트 피날레 VI', '라모르 카르트']],
  },
} as const satisfies ClassSkillSet;

export type PhantomSkillName = SkillNameFromSkillSet<typeof phantomSkills>;
