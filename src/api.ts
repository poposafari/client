import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  AccountReq,
  ApiErrorResponse,
  ApiResponse,
  BuyItemReq,
  BuyItemRes,
  CatchGroundItemReq,
  CatchStarterPokemonReq,
  CatchWildFailRes,
  CatchWildReq,
  CatchWildSuccessRes,
  EnterSafariReq,
  EnterSafariRes,
  EvolPcReq,
  GetIngameRes,
  GetItemRes,
  GetPcReq,
  GetPcRes,
  LoginRes,
  MovePcReq,
  PlayerGender,
  RegisterIngameReq,
  SocketInitData,
  UseItemReq,
} from './types';
import { HttpErrorCode, MODE } from './enums';
import { GM } from './core/game-manager';
import { SocketHandler } from './handlers/socket-handler';
import { changeTextSpeedToDigit, getPokemonSpriteKey } from './utils/string-util';

const Axios = axios.create({
  baseURL: 'https://poposafari.net/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

Axios.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

Axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originReq = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const code = error.response.data.data;

    if (!originReq._retry) {
      originReq._retry = true;
      if (code === HttpErrorCode.NOT_FOUND_ACCESS_TOKEN || code === HttpErrorCode.INVALID_ACCESS_TOKEN) {
        try {
          const res = await checkRefreshApi();
          const newAccessToken = res.data.data;

          localStorage.setItem('access_token', newAccessToken);

          if (originReq.headers) originReq.headers.Authorization = `Bearer ${newAccessToken}`;

          return Axios(originReq);
        } catch (errRefresh) {
          localStorage.removeItem('access_token');
          GM.changeMode(MODE.LOGIN);
          return Promise.reject(errRefresh);
        }
      } else if (code === HttpErrorCode.NOT_FOUND_REFRESH_TOKEN || code === HttpErrorCode.INVALID_REFRESH_TOKEN) {
        GM.changeMode(MODE.LOGIN);
      }
    }
    return Promise.reject(error);
  },
);

function handleSocket(apiName: string, success: boolean): void {
  const socketHandler = SocketHandler.getInstance();

  if (success) {
    if (['logoutApi'].includes(apiName)) {
      if (socketHandler.isSocketConnected()) {
        socketHandler.disconnect();
      }
    }
  }
}

export async function apiWrap<T>(api: () => Promise<{ data: any }>, apiName?: string): Promise<ApiResponse<T> | ApiErrorResponse> {
  try {
    GM.changeMode(MODE.CONNECT);

    const res = await api();
    const responseData = res.data;

    let finalResponse: ApiResponse<T>;

    if (typeof responseData === 'object' && responseData !== null && 'result' in responseData && 'data' in responseData) {
      finalResponse = responseData as ApiResponse<T>;
    } else {
      finalResponse = { result: true, data: responseData };
    }

    GM.popUi();

    if (apiName) {
      handleSocket(apiName, true);
    }

    return finalResponse;
  } catch (err: any) {
    GM.popUi();

    if (apiName) {
      handleSocket(apiName, false);
    }

    if (axios.isAxiosError(err) && err.response) {
      return err.response.data as ApiErrorResponse;
    }

    return {
      result: false,
      data: HttpErrorCode.NETWORK_ERROR,
    };
  }
}

export const registerApi = (data: AccountReq) => apiWrap<unknown>(() => Axios.post('/account/register', data));
export const loginLocalApi = (data: AccountReq) => apiWrap<LoginRes>(() => Axios.post('/account/login/local', data));
export const autoLoginApi = () => apiWrap<unknown>(() => Axios.get('/account/login/auto'));
export const checkRefreshApi = () => Axios.get('account/auth/refresh');
export const logoutApi = () => apiWrap<unknown>(() => Axios.get('/account/logout'), 'logoutApi');
export const deleteAccountApi = () => apiWrap<unknown>(() => Axios.get('/account/delete'));
export const restoreDeleteAccountApi = () => apiWrap<unknown>(() => Axios.get('/account/delete/restore'));
export const getIngameApi = () => apiWrap<GetIngameRes>(() => Axios.get('/ingame/get'));
export const registerIngameApi = (data: RegisterIngameReq) => apiWrap(() => Axios.post('/ingame/register', data));
export const getItemsApi = () => apiWrap<GetItemRes[]>(() => Axios.get('/bag/get'));
export const getPcApi = (data: GetPcReq) => apiWrap<GetPcRes[]>(() => Axios.post('/pc/get', data));
export const MovePcApi = (data: MovePcReq) => apiWrap<GetPcRes[]>(() => Axios.post('/pc/move', data));
export const EvolvePcApi = (data: EvolPcReq) => apiWrap<GetPcRes[]>(() => Axios.post('/pc/evol', data));
export const buyItemApi = (data: BuyItemReq) => apiWrap<BuyItemRes>(() => Axios.post('/bag/buy', data));
export const getAvailableTicketApi = () => apiWrap<number>(() => Axios.get('ingame/ticket/get'));
export const receiveAvailableTicketApi = () => apiWrap<GetItemRes>(() => Axios.get('ingame/ticket/receive'));
export const useSafariTicketApi = (data: UseItemReq) => apiWrap<BuyItemRes>(() => Axios.post('bag/ticket/use', data));
export const enterSafariZoneApi = (data: EnterSafariReq) => apiWrap<EnterSafariRes>(() => Axios.post('safari/enter', data));
export const exitSafariZoneApi = () => apiWrap<unknown>(() => Axios.get('safari/exit'));
export const catchWildApi = (data: CatchWildReq) => apiWrap<CatchWildSuccessRes | CatchWildFailRes>(() => Axios.post('safari/catch/wild', data));
export const catchGroundItemApi = (data: CatchGroundItemReq) => apiWrap<GetItemRes>(() => Axios.post('safari/catch/grounditem', data));
export const catchStarterPokemonApi = (data: CatchStarterPokemonReq) => apiWrap<GetItemRes>(() => Axios.post('safari/catch/starter', data));
