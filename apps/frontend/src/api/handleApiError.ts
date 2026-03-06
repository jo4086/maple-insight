// 예시 코드
import { isAxiosError } from 'axios';

export function handleApiError(error: unknown): never {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message ?? error.message ?? 'Server error';

    throw new Error(message);
  }

  throw new Error('Network Error');
}
