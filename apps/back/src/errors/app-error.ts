export const DEFAULT_ERROR_MESSAGE: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 대상을 찾을 수 없습니다.',
  409: '요청이 현재 상태와 충돌합니다.',
  429: '요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 내부 오류가 발생했습니다.',
  502: '외부 API 응답 중 오류가 발생했습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
};

export function createAppError(statusCode: number, message?: string): AppError {
  return {
    statusCode,
    message: message ?? DEFAULT_ERROR_MESSAGE[statusCode] ?? '알 수 없는 오류가 발생했습니다.',
  };
}

export function createExternalApiError(status: number | undefined, messageMap: Record<number, string>, fallbackMessage?: string): AppError {
  if (status && status >= 500) {
    return createAppError(502);
  }

  if (status === 429) {
    return createAppError(503, messageMap[429]);
  }

  if (status && status in messageMap) {
    return createAppError(status, messageMap[status]);
  }

  return createAppError(500, fallbackMessage);
}
