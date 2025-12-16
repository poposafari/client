export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',

  //ui
  SCENE_NOT_SET = 'SCENE_NOT_SET',
  UI_NOT_FOUND = 'UI_NOT_FOUND',

  //api
  NOT_FOUND_INGAME = 'NOT_FOUND_INGAME',
  NOT_FOUND_INGAME_ITEM = 'NOT_ALLOWED_INGAME_ITEM',
  FAIL_LOGIN = 'FAIL_LOGIN',
  INVALID_ACCESS_TOKEN = 'INVALID_ACCESS_TOKEN',
  NOT_FOUND_ACCESS_TOKEN = 'NOT_FOUND_ACCESS_TOKEN',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  NOT_FOUND_REFRESH_TOKEN = 'NOT_FOUND_REFRESH_TOKEN',
  ALREADY_EXIST_ACCOUNT = 'ALREADY_EXIST_ACCOUNT',
  ALREADY_EXIST_NICKNAME = 'ALREADY_EXIST_NICKNAME',
  NOT_ENOUGH_MONEY = 'NOT_ENOUGH_MONEY',
  NOT_ENOUGH_CANDY = 'NOT_ENOUGH_CANDY',
  NOT_ENOUGH_EVOLVE_CONDITION = 'NOT_ENOUGH_EVOLVE_CONDITION',
  NOT_PURCHASABLE_INGAME_ITEM = 'NOT_PURCHASABLE_INGAME_ITEM',
  NOT_SELLABLE_INGAME_ITEM = 'NOT_SELLABLE_INGAME_ITEM',
  INGAME_ITEM_STOCK_LIMIT_EXCEEDED = 'INGAME_ITEM_STOCK_LIMIT_EXCEEDED',

  //overworld
  PLAYER_DATA_NOT_SET = 'PLAYER_DATA_NOT_SET',
  MAP_NOT_FOUND = 'MAP_NOT_FOUND',

  //pc
  FAIL_CREATE_PC_MAPPING = 'FAIL_CREATE_PC_MAPPING',
}

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: 'Network error',

  //ui
  [ErrorCode.SCENE_NOT_SET]: 'Scene is not set',
  [ErrorCode.UI_NOT_FOUND]: 'Ui not found',

  //api
  [ErrorCode.NOT_FOUND_INGAME]: 'Ingame data not found',
  [ErrorCode.NOT_FOUND_INGAME_ITEM]: 'Not found ingame item',
  [ErrorCode.FAIL_LOGIN]: 'Login failed',
  [ErrorCode.INVALID_ACCESS_TOKEN]: 'Invalid access token',
  [ErrorCode.NOT_FOUND_ACCESS_TOKEN]: 'Not found access token',
  [ErrorCode.INVALID_REFRESH_TOKEN]: 'Invalid refresh token',
  [ErrorCode.NOT_FOUND_REFRESH_TOKEN]: 'Not found refresh token',
  [ErrorCode.ALREADY_EXIST_ACCOUNT]: 'Already exist account',
  [ErrorCode.ALREADY_EXIST_NICKNAME]: 'Already exist nickname',
  [ErrorCode.NOT_ENOUGH_MONEY]: 'Not enough money',
  [ErrorCode.NOT_ENOUGH_CANDY]: 'Not enough candy',
  [ErrorCode.NOT_PURCHASABLE_INGAME_ITEM]: 'Not purchasable ingame item',
  [ErrorCode.NOT_SELLABLE_INGAME_ITEM]: 'Not sellable ingame item',
  [ErrorCode.INGAME_ITEM_STOCK_LIMIT_EXCEEDED]: 'Ingame item stock limit exceeded',
  [ErrorCode.NOT_ENOUGH_EVOLVE_CONDITION]: 'Not enough evolve condition',

  //overworld
  [ErrorCode.PLAYER_DATA_NOT_SET]: 'Player data not set',
  [ErrorCode.MAP_NOT_FOUND]: 'Map not found',

  //pc
  [ErrorCode.FAIL_CREATE_PC_MAPPING]: 'Fail create pc mapping',
};

export class GameError extends Error {
  code: ErrorCode;
  context?: Record<string, unknown>;

  constructor(code: ErrorCode, context?: Record<string, unknown>) {
    const message = ErrorMessage[code];
    super(message);

    this.name = 'GameError';
    this.code = code;
    this.context = context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GameError);
    }
  }

  toString(): string {
    const contextStr = this.context ? ` ${JSON.stringify(this.context)}` : '';
    return `[${this.code}] ${this.message}${contextStr}`;
  }
}

export function throwError(code: ErrorCode, context?: Record<string, unknown>): never {
  throw new GameError(code, context);
}

export function assert(condition: unknown, code: ErrorCode, context?: Record<string, unknown>): asserts condition {
  if (!condition) {
    throw new GameError(code, context);
  }
}
