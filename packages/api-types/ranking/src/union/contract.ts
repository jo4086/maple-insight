export const UNION_RANKING_CONTRACT = {
  endpoint: '/ranking/overall',
  requiredParams: ['x-nxopen-api-key', 'date'] as const,
  optionalParams: ['world_name', 'ocid', 'page'] as const,
};
