/**
 * 기존 스킬 데이터를 유지하면서 특수 강화 스킬의 추가 필드만 합성하는 규칙을 둔다.
 *
 * 예: 프레이 강화처럼 원본 5차 스킬의 maxLevel 기준 값을 유지하고,
 * 6차 특수 강화 레벨에 따라 추가 수치만 더해지는 경우.
 */
export type SixthSpecialEnhancementExtendRule = {
  /** 원본 5차 스킬 ID */
  sourceSkillId: string;
  /** 50006에 있는 특수 강화 스킬 ID */
  enhancementSkillId: string;
  /** 원본 스킬에서 기준으로 삼을 레벨 */
  sourceLevel: 'max';
  /** 원본 maxLevel 기준 값으로 고정해서 사용하는 raw common 필드 */
  lockedFields: readonly string[];
  /** 특수 강화 스킬에서 추가로 합성하는 raw common 필드 */
  additiveFields: readonly string[];
  /** 규칙을 해석하기 위한 간단한 설명 */
  desc: string;
};

export const sixthSpecialEnhancementExtendRules = {
  프레이: {
    sourceSkillId: '400021003',
    enhancementSkillId: '500061002',
    sourceLevel: 'max',
    lockedFields: ['time', 'w', 'v2', 'u3', 'u4', 'w3', 'w4'],
    additiveFields: ['dot'],
    desc: '원본 프레이의 maxLevel 기준 최종 데미지 증가량을 고정하고, 50006의 dot 값을 추가 최종 데미지 증가량으로 합성한다.',
  },
  '인피니티 스펠': {
    sourceSkillId: '400051036',
    enhancementSkillId: '500061013',
    sourceLevel: 'max',
    lockedFields: ['time', 'x'],
    additiveFields: ['y'],
    desc: '원본 인피니티 스펠의 maxLevel 기준 지속시간과 추가 생성량을 고정하고, 50006의 y 값을 다가오는 죽음 데미지 증가량으로 합성한다.',
  },
  리스토어: {
    sourceSkillId: '400011109',
    enhancementSkillId: '500061065',
    sourceLevel: 'max',
    lockedFields: ['damage', 'x', 't', 'y'],
    additiveFields: ['u'],
    desc: '원본 리스토어의 maxLevel 기준 주요 수치를 고정하고, 50006의 u 값을 추가 효과로 합성한다.',
  },
} as const satisfies Record<string, SixthSpecialEnhancementExtendRule>;
