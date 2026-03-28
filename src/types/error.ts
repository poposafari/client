export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DTO_INVALID = 'DTO_INVALID',
  SESSION_MISSING = 'SESSION_MISSING',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ACCOUNT_ALREADY_EXIST = 'ACCOUNT_ALREADY_EXIST',
  FAILED_ACCOUNT = 'FAILED_ACCOUNT',
  ACCOUNT_ALREADY_DELETED = 'ACCOUNT_ALREADY_DELETED',
  EXCEED_REQUEST = 'EXCEED_REQUEST',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
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
