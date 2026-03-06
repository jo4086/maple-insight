import { useQuery } from '@tanstack/react-query';

import { searchNick } from '../api';

export const useSearchNick = (nick: string) => {
  return useQuery({
    queryKey: ['character', nick],
    queryFn: () => searchNick(nick),
    enabled: !!nick,
  });
};
