import { useMutation } from '@tanstack/react-query';

import { uploadFiles } from '../api';
import type { UploadParams, UploadResp } from '../types';

export function useUploadFiles() {
  return useMutation<UploadResp, Error, UploadParams>({
    mutationFn: uploadFiles,
    retry: (failureCount, error) => {
      if (error.message.includes('Network Error')) return true;
      return failureCount < 3;
    },
  });
}
