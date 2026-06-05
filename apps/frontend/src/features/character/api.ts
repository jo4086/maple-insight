import type { SearchNickResponse } from './types';

import { apiClient } from '@/api/client';
import { handleApiError } from '@/api/handleApiError';

type CharacterSearchApiResponse = {
  data: SearchNickResponse;
};

export async function searchNick(nick: string): Promise<SearchNickResponse> {
  try {
    const response = await apiClient.get<CharacterSearchApiResponse>('/character/search', {
      params: { nick },
    });

    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
