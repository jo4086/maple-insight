export const CHARACTER_SKILL_CONTRACT = {
  endpoint: '/character/skill',
  requiredParams: ['ocid', 'character_skill_grade'] as const,
  optionalParams: ['date'] as const,
} as const;
