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
  EvolPcRes,
  FeedWildEatenBerryReq,
  GetIngameRes,
  GetItemRes,
  GetPcReq,
  GetPcRes,
  LoginRes,
  MovePcReq,
  RegisterIngameReq,
  UseItemReq,
} from './types';
import { MODE } from './enums';
import { Game } from './core/manager/game-manager';
import { ErrorCode } from './core/errors';

const URL = (import.meta.env.NODE_ENV as string) === 'dev' ? 'http://localhost:9910/api' : 'https://poposafari.net/api';
const SKIP_CONNECT_UI_APIS = 'account/auth/refresh';
const Axios = axios.create({
  baseURL: URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

Axios.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem('access_token');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (!config.url?.includes(SKIP_CONNECT_UI_APIS)) {
    await Game.showConnectUi(config.url);
  }

  return config;
});

Axios.interceptors.response.use(
  async (response) => {
    if (!response.config.url?.includes(SKIP_CONNECT_UI_APIS)) {
      await Game.hideConnectUi(response.config.url);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originReq = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const code = (error.response?.data as any)?.data;

    if (!originReq.url?.includes(SKIP_CONNECT_UI_APIS)) {
      await Game.hideConnectUi(originReq.url);
    }

    if (!originReq._retry) {
      originReq._retry = true;
      if (code === ErrorCode.NOT_FOUND_ACCESS_TOKEN || code === ErrorCode.INVALID_ACCESS_TOKEN) {
        const res = await checkRefreshApi();

        const newAccessToken = res.data.data;
        localStorage.setItem('access_token', newAccessToken);

        if (originReq.headers) originReq.headers.Authorization = `Bearer ${newAccessToken}`;
        return Axios(originReq);
      } else if (code === ErrorCode.NOT_FOUND_REFRESH_TOKEN || code === ErrorCode.INVALID_REFRESH_TOKEN) {
        Game.changeMode(MODE.FAIL_TOKEN);
      }
    }
    return Promise.reject(error);
  },
);

export async function apiWrap<T>(api: () => Promise<{ data: any }>, apiName?: string): Promise<ApiResponse<T> | ApiErrorResponse> {
  try {
    const res = await api();
    const responseData = res.data;

    let finalResponse: ApiResponse<T>;

    if (typeof responseData === 'object' && responseData !== null && 'result' in responseData && 'data' in responseData) {
      finalResponse = responseData as ApiResponse<T>;
    } else {
      finalResponse = { result: true, data: responseData };
    }

    return finalResponse;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      return err.response.data as ApiErrorResponse;
    }

    return {
      result: false,
      data: ErrorCode.NETWORK_ERROR,
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
export const EvolvePcApi = (data: EvolPcReq) => apiWrap<EvolPcRes[]>(() => Axios.post('/pc/evol', data));
export const buyItemApi = (data: BuyItemReq) => apiWrap<BuyItemRes>(() => Axios.post('/bag/buy', data));
export const getAvailableTicketApi = () => apiWrap<number>(() => Axios.get('ingame/ticket/get'));
export const receiveAvailableTicketApi = () => apiWrap<GetItemRes>(() => Axios.get('ingame/ticket/receive'));
export const useSafariTicketApi = (data: UseItemReq) => apiWrap<BuyItemRes>(() => Axios.post('bag/ticket/use', data));
export const enterSafariZoneApi = (data: EnterSafariReq) => apiWrap<EnterSafariRes>(() => Axios.post('safari/enter', data));
export const exitSafariZoneApi = () => apiWrap<unknown>(() => Axios.get('safari/exit'));
export const catchWildApi = (data: CatchWildReq) => apiWrap<CatchWildSuccessRes | CatchWildFailRes>(() => Axios.post('safari/catch/wild', data));
export const catchGroundItemApi = (data: CatchGroundItemReq) => apiWrap<GetItemRes>(() => Axios.post('safari/catch/grounditem', data));
export const catchStarterPokemonApi = (data: CatchStarterPokemonReq) => apiWrap<GetItemRes>(() => Axios.post('safari/catch/starter', data));
export const feedWildEatenBerryApi = (data: FeedWildEatenBerryReq) => apiWrap<unknown>(() => Axios.post('safari/feed/wild', data));
