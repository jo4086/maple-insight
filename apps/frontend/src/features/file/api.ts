import type { UploadParams, UploadResp } from './types';

import { apiClient } from '@/api/client';
import { handleApiError } from '@/api/handleApiError';

export async function uploadFiles(params: UploadParams): Promise<UploadResp> {
  const { files, onProgress, version, uploader, profile } = params;

  if (!files.length) {
    throw new Error('upload files required');
  }

  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  if (version) form.append('version', version);
  if (uploader) form.append('uploader', uploader);
  if (profile) form.append('profile', JSON.stringify(profile));

  try {
    const response = await apiClient.post('/files', form, {
      onUploadProgress: (evt) => {
        const percent = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
        onProgress?.(percent);
      },
    });

    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
