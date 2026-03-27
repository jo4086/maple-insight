import { useQuery } from '@tanstack/react-query';

import { searchNick } from '../api';

export const useSearchNick = (nick: string) => {
  return useQuery({
    queryKey: ['character', 'search', nick],
    queryFn: () => searchNick(nick),
    enabled: nick.trim().length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};
