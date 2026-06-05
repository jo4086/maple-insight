export const DEFAULT_ERROR_MESSAGE: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 대상을 찾을 수 없습니다.',
  408: '요청 시간이 초과되었습니다.',
  409: '요청이 현재 상태와 충돌합니다.',
  429: '요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 내부 오류가 발생했습니다.',
  502: '외부 API 응답 중 오류가 발생했습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
  504: '외부 요청 시간이 초과되었습니다.',
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    message?: string,
    details?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message ?? DEFAULT_ERROR_MESSAGE[statusCode] ?? '알 수 없는 오류가 발생했습니다.', options);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export type IngestorError = AppError;

export function createAppError(
  statusCode: number,
  message?: string,
  details?: Record<string, unknown>,
  cause?: unknown,
): AppError {
  return new AppError(statusCode, message, details, {
    cause: cause instanceof Error ? cause : undefined,
  });
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export const isIngestorError = isAppError;

export function normalizeError(error: unknown, fallbackMessage: string, details?: Record<string, unknown>) {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return createAppError(500, error.message || fallbackMessage, details, error);
  }

  return createAppError(500, fallbackMessage, {
    ...details,
    rawError: error,
  });
}

export function formatErrorLog(error: unknown) {
  const normalized = normalizeError(error, '알 수 없는 오류가 발생했습니다.');

  return {
    name: normalized.name,
    statusCode: normalized.statusCode,
    message: normalized.message,
    details: normalized.details,
    cause: normalized.cause instanceof Error ? normalized.cause.message : normalized.cause,
  };
}
