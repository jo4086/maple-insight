export const OVERALL_RANKING_CONTRACT = {
  endpoint: '/ranking/overall',
  requiredParams: ['x-nxopen-api-key', 'date'] as const,
  optionalParams: ['world_name', 'world_type', 'class', 'ocid', 'page'] as const,
};
