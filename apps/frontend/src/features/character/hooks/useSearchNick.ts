import { useQuery } from '@tanstack/react-query';

import { searchNick } from '../api';

export function useSearchNick(nick: string) {
  return useQuery({
    queryKey: ['character', 'search', nick],
    queryFn: () => searchNick(nick),
    enabled: nick.trim().length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
}
