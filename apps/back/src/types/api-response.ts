export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  status: string;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  status: string;
  message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function createSuccessResponse<T>(data: T, status = 200): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    status: String(status),
  };
}
