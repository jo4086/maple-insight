import { useMutation } from '@tanstack/react-query';

import { apiClient } from './apiClient';
import { clients } from '@/lib/clients';

export const useSendNick = () => {
  return useMutation({
    mutationFn: async (nick: string) => {
      try {
        const res = await apiClient.get(`/api/character/search`, {
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

interface UploadParams {
  files: File[];
  profile?: Record<string, unknown>;
  streaming?: boolean;
  version?: string;
  uploader?: string;
  checksum?: string;
  onProgress?: (_percent: number) => void;
}
interface UploadResp {
  ok: boolean;
  item: { name: string; url?: string }[];
}
export const useUploadFiles = () => {
  return useMutation<UploadResp, Error, UploadParams>({
    mutationFn: async (params) => {
      if (!params) throw new Error('upload params required');

      const { files, onProgress, version, uploader, profile } = params;
      const form = new FormData();
      files.forEach((f) => form.append('files', f));

      if (version) form.append('version', version);

      // 선택적 uploader, profile 도 같이 보낼 수 있음
      if (uploader) form.append('uploader', uploader);
      if (profile) form.append('profile', JSON.stringify(profile));

      const res = await clients('upload').post('/api/ingest/upload', form, {
        headers: {
          'Content-Type': '',
        },
        onUploadProgress: (evt) => {
          const percent = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
          onProgress?.(percent);
        },
      });

      return res.data;
    },

    retry: (failureCount, error) => {
      // 서버 응답 상태 코드에 따라 분기 가능 (예시)
      if (error.message.includes('Network Error')) return true;
      return failureCount < 3;
    },
    // retryDelay: (attempt) => attempt * 1000,
  });
};
