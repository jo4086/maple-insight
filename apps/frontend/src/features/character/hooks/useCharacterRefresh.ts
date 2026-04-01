import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

export function useCharacterRefresh() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const nick = searchParams.get('nick')?.trim() ?? '';

  async function refresh() {
    if (!nick) return;

    await queryClient.refetchQueries({
      queryKey: ['character', 'search', nick],
      exact: true,
    });
  }

  return {
    nick,
    refresh,
  };
}
