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
export const CHARACTER_ENDPOINTS = [
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

export type CharacterSkillGrade = '0' | '1' | '1.5' | '2' | '2.5' | '3' | '4' | 'hyperpassive' | 'hyperactive' | '5' | '6';

export const COMMON_SKILL_GRADES: CharacterSkillGrade[] = ['0', '1', '2', '3', '4', 'hyperpassive', 'hyperactive', '5', '6'];

export const DUAL_BLADE_SKILL_GRADES: CharacterSkillGrade[] = ['0', '1', '1.5', '2', '2.5', '3', '4', 'hyperpassive', 'hyperactive', '5', '6'];

export type CharacterEndpoint = (typeof CHARACTER_ENDPOINTS)[number];

export function getSkillGrades(characterClass: string) {
  if (characterClass === '듀얼블레이더') {
    return DUAL_BLADE_SKILL_GRADES;
  }

  return COMMON_SKILL_GRADES;
}
