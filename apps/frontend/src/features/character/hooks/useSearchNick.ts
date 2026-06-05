import { useQuery } from '@tanstack/react-query';

import { searchNick } from '../api';
import { characterQueryKeys } from '../queryKeys';

export function useSearchNick(nick: string) {
  const trimmedNick = nick.trim();

  return useQuery({
    queryKey: characterQueryKeys.search(trimmedNick),
    queryFn: () => searchNick(trimmedNick),
    enabled: trimmedNick.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
}
