import axios, { HttpStatusCode } from 'axios';
import { eventBus } from './event-bus';
import { EVENT } from '../enums/event';
import i18next from 'i18next';
import { MODE } from '../enums/mode';

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  msg: string;
  status: number;
  code: string;
  detail?: any;
};

type GameLogicError = {
  success: false;
  reason: GameLogicErrorCode;
};

export type ApiResponse<T> = ApiSuccess<T>;

export const enum GameLogicErrorCode {
  INSUFFICIENT_ITEM = 'INSUFFICIENT_ITEM',
  NOT_FOUND_DATA = 'NOT_FOUND_DATA',
  WRONG_REQUEST_STOCK = 'WRONG_REQUEST_STOCK',
  MAX_STOCK = 'MAX_STOCK',
  NOT_PURCHASABEE_ITEM = 'NOT_PURCHASABEE_ITEM',
  NOT_ENOUGH_CANDY = 'NOT_ENOUGH_CANDY',
  NOT_ENOUGH_STOCK = 'NOT_ENOUGH_STOCK',
  NOT_ENOUGH_TICKET = 'NOT_ENOUGH_TICKET',
  FULL_BOX = 'FULL_BOX',
}

export const enum HttpErrorCode {
  ALREADY_EXIST_ACCOUNT = 'ALREADY_EXIST_ACCOUNT',
  ALREADY_EXIST_NICKNAME = 'ALREADY_EXIST_NICKNAME',
  LOGIN_FAIL = 'LOGIN_FAIL',
  NOT_FOUND_ACCOUNT = 'NOT_FOUND_ACCOUNT',
  NOT_FOUND_USER = 'NOT_FOUND_USER',
  NOT_FOUND_TOKEN = 'NOT_FOUND_TOKEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
}

export async function apiWrap<T>(api: () => Promise<{ data: ApiResponse<T> }>): Promise<ApiResponse<T> | null> {
  try {
    eventBus.emit(EVENT.OVERLAP_MODE, MODE.CONNECT);
    const res = await api();
    eventBus.emit(EVENT.POP_MODE);

    if (!res.data.success) {
      gamelogicErrorHandle(res.data as unknown as GameLogicError);
    }

    return res.data;
  } catch (err: any) {
    eventBus.emit(EVENT.POP_MODE);
    if (axios.isAxiosError(err)) {
      const errData = err.response?.data as ApiError;
      errorHandle(errData.code as HttpErrorCode);
    }

    return null;
  }
}

const gamelogicErrorHandle = (err: GameLogicError) => {
  let value;
  let end;

  switch (err.reason) {
    case GameLogicErrorCode.WRONG_REQUEST_STOCK:
      break;
    case GameLogicErrorCode.INSUFFICIENT_ITEM:
      break;
    case GameLogicErrorCode.MAX_STOCK:
      value = 'warn_max_stock';
      break;
    case GameLogicErrorCode.NOT_ENOUGH_CANDY:
      value = 'warn_no_candy';
      break;
    case GameLogicErrorCode.NOT_ENOUGH_STOCK:
      break;
    case GameLogicErrorCode.NOT_ENOUGH_TICKET:
      value = 'warn_no_ticket';
      break;
    case GameLogicErrorCode.NOT_FOUND_DATA:
      break;
    case GameLogicErrorCode.NOT_PURCHASABEE_ITEM:
      break;
    case GameLogicErrorCode.FULL_BOX:
      value = 'warn_full_box';
      break;
  }

  eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [{ type: 'sys', format: 'talk', content: i18next.t(`message:${value}`), speed: 10, end: end }]);
};

const errorHandle = (code: HttpErrorCode) => {
  let value;

  switch (code) {
    case HttpErrorCode.ALREADY_EXIST_ACCOUNT:
    case HttpErrorCode.ALREADY_EXIST_NICKNAME:
      value = 'existAccount';
      break;
    case HttpErrorCode.LOGIN_FAIL:
      value = 'invalidUsernameOrPassword';
      break;
    case HttpErrorCode.NOT_FOUND_USER:
      eventBus.emit(EVENT.CHANGE_MODE, MODE.WELCOME);
      return;
    case HttpErrorCode.INVALID_TOKEN:
    case HttpErrorCode.SESSION_EXPIRED:
    case HttpErrorCode.INVALID_REFRESH_TOKEN:
      eventBus.emit(EVENT.CHANGE_MODE, MODE.LOGIN);
      value = 'sessionExpired';
      break;
    case HttpErrorCode.NOT_FOUND_TOKEN:
      eventBus.emit(EVENT.CHANGE_MODE, MODE.LOGIN);
      return;
    case HttpErrorCode.NOT_FOUND_ACCOUNT:
      eventBus.emit(EVENT.CHANGE_MODE, MODE.LOGIN);
      break;
  }

  eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [{ type: 'sys', format: 'talk', content: i18next.t(`message:${value}`), speed: 10 }]);
};
