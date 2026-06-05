/** 버프 지속시간 증가 효과를 기본적으로 받지 않는 전직 차수 */
export const buffDurationUnaffectedSkillDisplayTypes = ['hyper', 'fifth', 'sixth'] as const;

/** 버프 지속시간 증가 효과를 기본적으로 받지 않는 전직 차수 타입 */
export type BuffDurationUnaffectedSkillDisplayType = (typeof buffDurationUnaffectedSkillDisplayTypes)[number];
