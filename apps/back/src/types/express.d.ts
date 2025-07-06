import type { Request, Response, NextFunction } from 'express';

declare global {
  interface AppError {
    success: boolean;
    status: string;
    message: string;
    [key: string]: unknown;
  }

  export type AppHandler<
    Params extends object = object,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery extends object = object,
  > = (
    _req: Request<Params, ResBody, ReqBody, ReqQuery>,
    _res: Response<unknown, Record<string, unknown>>,
    _next?: NextFunction,
  ) => void | Promise<void | Response<string, Record<string, unknown>>>;

  type AppErrorHandler<
    Params extends object = object,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery extends object = object,
    ErrType = AppError,
  > = (
    _err: ErrType,
    _req: Request<Params, ResBody, ReqBody, ReqQuery>,
    _res: Response<unknown, Record<string, unknown>>,
    _next?: NextFunction,
  ) => void | Promise<void | Response<string, Record<string, unknown>>>;
}

export {};
