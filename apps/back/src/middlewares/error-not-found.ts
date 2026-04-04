import type { Request, Response, NextFunction } from 'express';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  const error: AppError = {
    success: false,
    statusCode: 404,
    message: '요청한 경로를 찾을 수 없습니다.',
  };

  next(error);
}
