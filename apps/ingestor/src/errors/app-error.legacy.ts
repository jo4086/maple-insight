export type IngestorErrorCode =
  | 'INVALID_ENV'
  | 'INVALID_PARAMETER'
  | 'REQUEST_TIMEOUT'
  | 'EXTERNAL_API_ERROR'
  | 'OPTIONAL_DATA_NOT_AVAILABLE'
  | 'INVALID_RESPONSE'
  | 'RUNTIME_ERROR';

export class IngestorError extends Error {
  constructor(
    public readonly code: IngestorErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'IngestorError';
  }
}

export function isIngestorError(error: unknown): error is IngestorError {
  return error instanceof IngestorError;
}

export function createInvalidEnvError(message: string, details?: Record<string, unknown>) {
  return new IngestorError('INVALID_ENV', message, details);
}

export function createInvalidParameterError(message: string, details?: Record<string, unknown>) {
  return new IngestorError('INVALID_PARAMETER', message, details);
}

export function createRequestTimeoutError(message: string, details?: Record<string, unknown>, cause?: unknown) {
  return new IngestorError('REQUEST_TIMEOUT', message, details, { cause: cause instanceof Error ? cause : undefined });
}

export function createExternalApiError(message: string, details?: Record<string, unknown>, cause?: unknown) {
  return new IngestorError('EXTERNAL_API_ERROR', message, details, { cause: cause instanceof Error ? cause : undefined });
}

export function createOptionalDataNotAvailableError(message: string, details?: Record<string, unknown>) {
  return new IngestorError('OPTIONAL_DATA_NOT_AVAILABLE', message, details);
}

export function createInvalidResponseError(message: string, details?: Record<string, unknown>) {
  return new IngestorError('INVALID_RESPONSE', message, details);
}

export function normalizeError(error: unknown, fallbackMessage: string, details?: Record<string, unknown>) {
  if (isIngestorError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new IngestorError('RUNTIME_ERROR', error.message || fallbackMessage, details, { cause: error });
  }

  return new IngestorError('RUNTIME_ERROR', fallbackMessage, {
    ...details,
    rawError: error,
  });
}

export function formatErrorLog(error: unknown) {
  const normalized = normalizeError(error, 'Unexpected runtime error');

  return {
    name: normalized.name,
    code: normalized.code,
    message: normalized.message,
    details: normalized.details,
    cause: normalized.cause instanceof Error ? normalized.cause.message : normalized.cause,
  };
}
