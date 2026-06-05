export const GUILD_RANKING_CONTRACT = {
  endpoint: '/ranking/guild',
  requiredParams: ['x-nxopen-api-key', 'date', 'ranking_type'] as const,
  optionalParams: ['world_name', 'guild_name', 'page'] as const,
};
