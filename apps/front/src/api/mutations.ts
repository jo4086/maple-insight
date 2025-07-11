import { useMutation } from '@tanstack/react-query';

import { apiClient } from './apiClient';

export const useSendNick = () => {
  return useMutation({
    mutationFn: async (nick: string) => {
      try {
        const res = await apiClient.get(`/character/search`, {
          params: { nick },
        });
        console.log(res.data);
        return res.data;
      } catch (error) {
        // Axios 에러라면 에러 응답에서 메시지 추출 가능
        if (error.response) {
          throw new Error(error.response.data?.message || 'Server error');
        } else {
          throw new Error('Network error');
        }
      }
    },
  });
};
