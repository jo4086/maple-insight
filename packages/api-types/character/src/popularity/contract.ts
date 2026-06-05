export const CHARACTER_POPULARITY_CONTRACT = {
  endpoint: '/character/popularity',
  requiredParams: ['ocid'] as const,
  optionalParams: ['date'] as const,
} as const;
