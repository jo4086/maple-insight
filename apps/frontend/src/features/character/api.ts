import type { SearchNickResponse } from './types';

import { apiClient } from '@/api/client';
import { handleApiError } from '@/api/handleApiError';

export async function searchNick(nick: string) {
  try {
    const response = await apiClient.get('/character/search', {
      params: { nick },
    });

    const data: SearchNickResponse = response.data.data;
    // console.log('data:', data);

    return data;
    // return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
