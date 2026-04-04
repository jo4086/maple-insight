import type { ApiErrorResponse } from '../types/api-response';

type ErrorWithStatus = Partial<AppError> & {
  statusCode?: number;
  status?: string;
  message?: string;
};

function toErrorResponse(error: ErrorWithStatus): { statusCode: number; body: ApiErrorResponse } {
  const statusCode =
    typeof error.statusCode === 'number'
      ? error.statusCode
      : typeof error.status === 'string' && !Number.isNaN(Number(error.status))
        ? Number(error.status)
        : 500;

  return {
    statusCode,
    body: {
      success: false,
      data: null,
      status: String(statusCode),
      message: error.message || '서버 내부 오류가 발생했습니다.',
    },
  };
}

export const errorHandler: AppErrorHandler = (error, _req, res, _next) => {
  console.error(error);

  const { statusCode, body } = toErrorResponse(error);
  res.status(statusCode).json(body);
};
