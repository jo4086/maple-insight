import type { ClassGroupKey, FinalClassNameKey } from '@maple/data-class';
import type { LineageKey } from '@maple/data-core';

import type { FifthAdventurerClassGroupSkill, FifthClassGroupSkill, FifthLineageBlessingSkill, FifthLineageCommonSkill } from './core';

import type { SkillLinkedGroups } from '@/types';

export const fifthLineageBlessingSkillMap: Record<LineageKey, readonly FifthLineageBlessingSkill[]> = {
  adventurer: ['메이플월드 여신의 축복'],
  cygnus: ['여제 시그너스의 축복', '초월자 시그너스의 축복'],
  heroes: ['메이플월드 여신의 축복'],
  resistance: ['메이플월드 여신의 축복'],
  demon: ['이계 여신의 축복'],
  nova: ['그란디스 여신의 축복'],
  transcendent: ['초월자 륀느의 기원'],
  friendsWorld: ['이계 여신의 축복'],
  lef: ['그란디스 여신의 축복'],
  anima: ['그란디스 여신의 축복'],
};

export const fifthLineageCommonSkillMap: Partial<Record<LineageKey, readonly FifthLineageCommonSkill[]>> = {
  cygnus: ['시그너스 팔랑크스'],
  heroes: ['프리드의 가호'],
  resistance: ['레지스탕스 라인 인팬트리'],
  demon: ['콜 마스테마'],
  nova: ['판테온'],
  transcendent: ['트랜센던트'],
  friendsWorld: ['이계의 잔상'],
  lef: ['매직 서킷 풀드라이브'],
  anima: ['화중군자'],
};

export const fifthAdventurerClassGroupSkillMap: Record<ClassGroupKey, readonly FifthAdventurerClassGroupSkill[]> = {
  warrior: ['블리츠 실드'],
  mage: ['아르카나 오버라이드'],
  archer: ['이볼브'],
  thief: ['얼티밋 다크 사이트'],
  pirate: ['파이렛 플래그'],
};

export const fifthClassGroupSkillMap: Record<ClassGroupKey, readonly FifthClassGroupSkill[]> = {
  warrior: ['오라 웨폰', '바디 오브 스틸'],
  mage: ['오버로드 마나', '에테리얼 폼'],
  archer: ['가이디드 애로우', '크리티컬 리인포스'],
  thief: ['베놈 버스트', '레디 투 다이'],
  pirate: ['로디드 다이스', '오버 드라이브'],
};

export const fifthClassSkillMap = {
  hero: {
    skills: ['소드 오브 버닝 소울', '콤보 데스폴트', '콤보 인스팅트', '소드 일루전'],
    internalSkills: ['소드 오브 버닝 소울 - 고정', '소드 오브 버닝 소울 - 일반'],
  },
  paladin: {
    skills: ['홀리 유니티', '블래스드 해머', '그랜드 크로스', '마이티 묠니르'],
  },
  'dark-knight': {
    skills: ['다크 스피어', '비홀더 임팩트', '피어스 사이클론', '다크니스 오라'],
  },

  'arch-mage-fire-poison': {
    skills: ['도트 퍼니셔', '포이즌 노바', '퓨리 오브 이프리트', '포이즌 체인'],
  },
  'arch-mage-ice-lightning': {
    skills: ['프로스트 아크', '썬더 브레이크', '스피릿 오브 스노우', '주피터 썬더'],
  },
  bishop: {
    skills: ['프레이', '엔젤 오브 리브라', '피스메이커', '디바인 퍼니시먼트'],
  },

  'bow-master': {
    skills: ['애로우 레인', '잔영의 시', '퀴버 풀버스트', '실루엣 미라주'],
  },
  marksman: {
    skills: ['트루 스나이핑', '스플릿 애로우', '차지드 애로우', '리피팅 크로스보우 카트리지'],
  },
  pathfinder: {
    skills: ['얼티밋 블래스트', '에인션트 템페스트', '옵시디언 배리어', '렐릭 언바운드'],
    linkedGroups: [
      {
        source: '에인션트 템페스트',
        linkedSkills: ['프라이멀 템페스트', '템페스트 인퓨전'],
      },
      {
        source: '옵시디언 배리어',
        linkedSkills: ['옵시디언 배리어(디스차지)', '옵시디언 배리어(블래스트)', '옵시디언 배리어(트랜지션)'],
      },
      {
        source: '렐릭 언바운드',
        linkedSkills: ['렐릭 언바운드(디스차지)', '렐릭 언바운드(블래스트)', '렐릭 언바운드(트랜지션)'],
      },
    ],
  },

  'night-lord': {
    skills: ['스프레드 스로우', '풍마수리검', '다크로드의 비전서', '스로우 블래스팅'],
  },
  shadower: {
    skills: ['쉐도우 어썰트', '절개', '소닉 블로우', '멸귀참영진'],
    internalSkills: ['절개 - 참격'],
  },
  'dual-blader': {
    skills: ['블레이드 스톰', '카르마 퓨리', '블레이드 토네이도', '헌티드 엣지'],
  },

  viper: {
    skills: ['라이트닝 폼', '서펜트 스크류', '퓨리어스 차지', '하울링 피스트'],
  },
  captain: {
    skills: ['불릿 파티', '데드아이', '노틸러스 어썰트', '데스 트리거'],
  },
  'cannon-master': {
    skills: ['빅 휴즈 기간틱 캐논볼', 'ICBM', '스페셜 몽키 에스코트', '풀 메이커'],
  },

  'soul-master': {
    skills: ['코스모스', '엘리시온', '소울 이클립스', '플레어 슬래시'],
  },
  mikhail: {
    skills: ['로 아이아스', '클라우 솔라스', '소드 오브 소울 라이트', '라이트 오브 커리지'],
  },
  'flame-wizard': {
    skills: ['블레이징 오비탈 플레임', '플레임 디스차지', '인피니티 플레임 서클', '샐리맨더 미스칩'],
  },
  'wind-breaker': {
    skills: ['하울링 게일', '아이들 윔', '윈드 월', '볼텍스 스피어'],
  },
  'night-walker': {
    skills: ['쉐도우 스피어', '쉐도우 서번트 익스텐드', '쉐도우 바이트', '래피드 스로우'],
    linkedGroups: [
      {
        source: '쉐도우 서번트 익스텐드',
        linkedSkills: ['쉐도우 쉬프트'],
      },
    ],
  },
  striker: {
    skills: ['신뇌합일', '교아탄', '뇌신창격', '창뇌연격'],
  },

  aran: {
    skills: ['부스트 엔드-아드레날린 서지', '브랜디쉬 마하', '파이널 비욘더-백호', '블리자드 템페스트'],
  },
  evan: {
    skills: ['엘리멘탈 블래스트', '드래곤 브레이크', '조디악 레이', '스파이럴 오브 마나'],
    linkedGroups: [
      {
        source: '드래곤 브레이크',
        linkedSkills: ['임페리얼 브레스', '브레이크-돌아와!'],
      },
    ],
  },
  luminous: {
    skills: ['진리의 문', '퍼니싱 리소네이터', '빛과 어둠의 세례', '리버레이션 오브'],
  },
  mercedes: {
    skills: ['엘리멘탈 고스트', '실피디아', '이르칼라의 숨결', '로얄 나이츠'],
  },
  phantom: {
    skills: ['조커', '블랙잭', '마크 오브 팬텀', '리프트 브레이크'],
  },
  eunwol: {
    skills: ['환혼요호진', '귀문진', '진 귀참', '파쇄 연권'],
  },

  'demon-slayer': {
    skills: ['데몬 어웨이크닝', '요르문간드', '오르트로스', '데몬 베인'],
  },
  'demon-avenger': {
    skills: ['데몬 프렌지', '블러드 피스트', '디멘션 소드', '레버넌트'],
    linkedGroups: [
      {
        source: '데몬 프렌지',
        linkedSkills: ['프렌지 브레이크'],
      },
    ],
  },
  blaster: {
    skills: ['벙커 버스터', '발칸 펀치', '버닝 브레이커', '애프터이미지 쇼크'],
  },
  'battle-mage': {
    skills: ['유니온 오라', '블랙 매직 알터', '그림 리퍼', '어비셜 라이트닝'],
  },
  'wild-hunter': {
    skills: ['커맨드 : 프레데터스 아이', '와일드 발칸 : 오버 드라이브', '프라이멀 블룸', '오버바이트'],
  },
  xenon: {
    skills: ['메가 스매셔', '오버로드 모드', '홀로그램 그래피티 : 융합', '포톤 레이'],
  },
  mechanic: {
    skills: ['멀티플 옵션 : M-FL', '마이크로 미사일 컨테이너', '메탈아머 전탄발사', '메카 캐리어'],
  },

  kaiser: {
    skills: ['가디언 오브 노바', '윌 오브 소드 : 스트라이크', '드라코 슬래셔', '드래곤 블레이즈'],
  },
  kain: {
    skills: ['[발현] 드래곤 버스트', '[처형] 페이탈 블리츠', '타나토스 디센트', '그립 오브 애거니'],
  },
  cadena: {
    skills: ['체인아츠:퓨리', 'A.D 오드넌스', '체인아츠:메일스트롬', '웨폰 버라이어티 피날레'],
  },
  'angelic-buster': {
    skills: ['에너지 버스트', '스포트라이트', '마스코트 패밀리어', '트리니티 퓨전'],
  },

  zero: {
    skills: ['리미트 브레이크', '조인트 어택', '쉐도우 플래시', '에고 웨폰'],
  },

  kinesis: {
    skills: ['싸이킥 불릿', '싸이킥 노바', '얼티메이트 : 체크메이트', '싸이킥 보드'],
  },

  adele: {
    skills: ['루인', '인피니트', '리스토어', '스톰'],
  },
  illium: {
    skills: ['크리스탈 이그니션', '그람홀더', '크리스탈 트랜스폼', '크리스탈 게이트'],
    linkedGroups: [
      {
        source: '크리스탈 이그니션',
        linkedSkills: ['리액션:스펙트럼'],
      },
      {
        source: '크리스탈 트랜스폼',
        linkedSkills: ['소울 오브 크리스탈', '소울 오브 크리스탈:에센스'],
      },
    ],
  },
  khali: {
    skills: ['헥스 : 판데모니움', '보이드 버스트', '아츠 : 아스트라', '레조네이트 : 얼티메이텀'],
  },
  ark: {
    skills: ['근원의 기억', '인피니티 스펠', '새어 나오는 악몽', '영원히 굶주리는 짐승'],
    linkedGroups: [
      {
        source: '새어 나오는 악몽',
        linkedSkills: ['새어 나오는 흉몽'],
      },
    ],
  },

  len: {
    skills: ['매화검 절기 : 만리향', '망혼각성', '매화검 절기 : 섬무', '망혼검 절기 : 심검'],
  },
  lara: {
    skills: ['큰 기지개', '해 강 산 바람', '용솟음치는 정기', '산등성이 굽이굽이'],
  },
  hoyoung: {
    skills: ['선기 : 극대 분신난무', '권술 : 산령소환', '선기 : 강림 괴력난신', '선기 : 천지인 환영'],
  },
} as const satisfies Partial<Record<FinalClassNameKey, SkillLinkedGroups>>;
