export const characterQueryKeys = {
  all: ['character'] as const,
  search: (nick: string) => [...characterQueryKeys.all, 'search', nick] as const,
};
