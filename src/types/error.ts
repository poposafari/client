export enum ErrorCode {
  ERR_BAD_REQUEST = 'ERR_BAD_REQUEST',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DTO_INVALID = 'DTO_INVALID',
  RT_MISSING = 'RT_MISSING',
  AT_MISSING = 'AT_MISSING',
  AT_EXPIRED = 'AT_EXPIRED',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  FAILED_LOGIN = 'FAILED_LOGIN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_DELETED = 'USER_ALREADY_DELETED',
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode | string,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
