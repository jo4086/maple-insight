export const CHARACTER_STAT_CONTRACT = {
  endpoint: '/character/stat',
  requiredParams: ['ocid'] as const,
  optionalParams: ['date'] as const,
} as const;
