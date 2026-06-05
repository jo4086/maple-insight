// NOTE: 캐릭터 조회 API 주소

const CHARACTER_API_ENDPOINTMAP = {
  list: '캐릭터 목록 조회',
  'user/achievement': '업적 정보 조회',
  id: '캐릭터 식별(ocid) 조회',
  basic: '기본 정보 조회',
  popularity: '인기도 정보 조회',
  stat: '종합 능력치 정보 조회',
  'hyper-stat': '하이퍼스탯 정보 조회',
  propensity: '성향 정보 조회',
  ability: '어빌리티 정보 조회',
  'item-equipment': '장착 장비 정보 조회',
  'cashitem-equipment': '장작 캐시 장비 정보 조회',
  'symbol-equipment': '장작 심볼 정보 조회',
  'set-effect': '적용 세트 효과 정보 조회',
  'beauty-equipment': '장착 헤어, 성형, 피부 정보 조회',
  'android-equipment': '장착 안드로이드 정보 조회',
  'pet-equipment': '장착 펫 정보 조회',
  skill: '스킬 정보 조회',
  'link-skill': '장착 링크 스킬 정보 조회',
  vmatrix: 'V매트릭스 정보 조회',
  hexamatrix: 'HEXA코어 정보 조회',
  'hexamatrix-stat': 'HEXA 매트릭스 설정 HEXA 스캣 정보 조회',
  dojang: '무릉도장 최고 기록 정보 조회',
  'ring-reserve-skill-equipment': '예비 특수 반지 장착 정보 조회',
};

export const PERCENT_STAT_NAMES = new Set([
  '이동속도',
  '점프력',
  '스탠스',
  '아이템 드롭률',
  '메소 획득량',
  '버프 지속시간',
  '재사용 대기시간 감소 (%)',
  '재사용 대기시간 미적용',
  '속성 내성 무시',
  '무기 숙련도',
  '추가 경험치 획득',
  '소환수 지속시간 증가',
]);

export const PERCENT_STAT_KEYWORDS = ['데미지', '확률'];

// INFO: Endpoint 관련 타입

export const CHARACTER_API_ENDPOINTS = [
  // INFO: 실제 Endpoint 값
  'basic',
  'popularity',
  'stat',
  'hyper-stat',
  'propensity',
  'ability',
  'item-equipment',
  'cashitem-equipment',
  'symbol-equipment',
  'set-effect',
  'beauty-equipment',
  'android-equipment',
  'pet-equipment',
  'skill',
  'link-skill',
  'vmatrix',
  'hexamatrix',
  'hexamatrix-stat',
  'dojang',
  'other-stat',
  'ring-reserve-skill-equipment',
] as const;

export const CHARACTER_COMPOSITE_ENDPOINTS = ['equipment'] as const;

export const CHARACTER_ENDPOINTS = [...CHARACTER_API_ENDPOINTS, ...CHARACTER_COMPOSITE_ENDPOINTS] as const;

export type CharacterApiEndpoint = (typeof CHARACTER_API_ENDPOINTS)[number];
export type CharacterCompositeEndpoint = (typeof CHARACTER_COMPOSITE_ENDPOINTS)[number];
export type CharacterEndpoint = (typeof CHARACTER_ENDPOINTS)[number];

// NOTE: === 캐릭터 스킬 ===
export type CharacterSkillGrade = '0' | '1' | '1.5' | '2' | '2.5' | '3' | '4' | 'hyperpassive' | 'hyperactive' | '5' | '6';

export const COMMON_SKILL_GRADES: CharacterSkillGrade[] = ['0', '1', '2', '3', '4', 'hyperpassive', 'hyperactive', '5', '6'];

export const DUAL_BLADE_SKILL_GRADES: CharacterSkillGrade[] = ['0', '1', '1.5', '2', '2.5', '3', '4', 'hyperpassive', 'hyperactive', '5', '6'];

export function getSkillGrades(characterClass: string) {
  if (characterClass === '듀얼블레이더') {
    return DUAL_BLADE_SKILL_GRADES;
  }

  return COMMON_SKILL_GRADES;
}
