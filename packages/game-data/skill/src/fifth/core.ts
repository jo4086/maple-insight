export const fifthLineageBlessingSkills = [
  '메이플월드 여신의 축복',
  '여제 시그너스의 축복',
  '초월자 시그너스의 축복',
  '그란디스 여신의 축복',
  '이계 여신의 축복',
  '초월자 륀느의 기원',
] as const;

export const fifthLineageCommonSkills = [
  '시그너스 팔랑크스',
  '레지스탕스 라인 인팬트리',
  '콜 마스테마',
  '프리드의 가호',
  '판테온',
  '매직 서킷 풀드라이브',
  '트랜센던트',
  '이계의 잔상',
  '화중군자',
];

export const fifthAdventurerClassGroupSkills = ['블리츠 실드', '아르카나 오버라이드', '이볼브', '얼티밋 다크 사이트', '파이렛 플래그'] as const;

export const fifthLineageClassGroupSkills = [...fifthLineageCommonSkills, ...fifthAdventurerClassGroupSkills] as const;

export type FifthLineageClassGroupSkill = (typeof fifthLineageClassGroupSkills)[number];

export const fifthClassGroupSkills = [
  '오라 웨폰',
  '바디 오브 스틸',
  '오버로드 마나',
  '에테리얼 폼',
  '가이디드 애로우',
  '크리티컬 리인포스',
  '베놈 버스트',
  '레디 투 다이',
  '로디드 다이스',
  '오버 드라이브',
] as const;

export const fifthCommonSkills = [
  '에르다 노바',
  '에르다 샤워',
  '에르다의 의지',
  '블링크',
  '로프 커넥트',
  '쓸만한 홀리 심볼',
  '쓸만한 홀리 파운틴',
  '쓸만한 윈드 부스터',
  '쓸만한 어드밴스드 블레스',
  '쓸만한 컴뱃 오더스',
  '쓸만한 하이퍼 바디',
  '쓸만한 샤프 아이즈',
  '쓸만한 미스틱 도어',
  '스파이더 인 미러',
  '크레스트 오브 더 솔라',
];

export type FifthLineageBlessingSkill = (typeof fifthLineageBlessingSkills)[number];
export type FifthLineageCommonSkill = (typeof fifthLineageCommonSkills)[number];
export type FifthAdventurerClassGroupSkill = (typeof fifthAdventurerClassGroupSkills)[number];
export type FifthClassGroupSkill = (typeof fifthClassGroupSkills)[number];
export type FifthCommonSkill = (typeof fifthCommonSkills)[number];
