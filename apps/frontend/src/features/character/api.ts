import type { SearchNickResponse } from './types';

import { apiClient } from '@/api/client';
import { handleApiError } from '@/api/handleApiError';

type CharacterSearchApiResponse = {
  success: boolean;
  data: SearchNickResponse;
  message?: string;
};

export async function searchNick(nick: string): Promise<SearchNickResponse> {
  try {
    const response = await apiClient.get<CharacterSearchApiResponse>('/character/search', {
      params: { nick },
    });

    if (!response.data || response.data.data === undefined) {
      throw new Error('API 응답에 캐릭터 데이터가 없습니다. /api 프록시 또는 백엔드 응답을 확인해주세요.');
    }

    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
