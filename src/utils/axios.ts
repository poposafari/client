import axios from 'axios';
import { ModeManager } from '../managers';
import { LoadingDefaultUi } from '../ui/loading-default-ui';
import { NoneMode } from '../modes';

interface AccountReq {
  username: string;
  password: string;
}

interface NicknameReq {
  nickname: string;
  gender: 'boy' | 'girl';
  avatar: '1' | '2' | '3' | '4';
}

interface BaseRes {
  result: string;
}

const AxiosManager = axios.create({
  baseURL: 'https://localhost:443',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

AxiosManager.interceptors.request.use((config) => {
  const mode = ModeManager.getInstance().getCurrentMode();
  const topUi = mode.getUiStackTop();
  if (topUi) {
    mode.getUiStackTop().pause(true);
  }
  mode.addUiStack('LoadingDefaultUi');
  return config;
});

AxiosManager.interceptors.response.use(
  (config) => {
    const mode = ModeManager.getInstance().getCurrentMode();
    const topUi = mode.getUiStackTop();
    if (topUi instanceof LoadingDefaultUi) {
      mode.getUiStackTop().clean();
      mode.getUiStack().pop();
    }
    return config;
  },
  (error) => {
    const mode = ModeManager.getInstance().getCurrentMode();
    const topUi = mode.getUiStackTop();
    if (topUi instanceof LoadingDefaultUi) {
      mode.getUiStackTop().clean();
      mode.getUiStack().pop();
    }
    return Promise.reject(error);
  },
);

export const registerApi = async (data: AccountReq): Promise<BaseRes> => {
  const res = await AxiosManager.post<BaseRes>('/account/register', data);
  return res.data;
};

export const loginApi = async (data: AccountReq): Promise<BaseRes> => {
  const res = await AxiosManager.post<BaseRes>('/account/login', data);
  return res.data;
};

export const autoLoginApi = async (): Promise<BaseRes> => {
  const res = await AxiosManager.get<BaseRes>('/account/auto-login');
  return res.data;
};

export const nicknameApi = async (data: NicknameReq): Promise<BaseRes> => {
  const res = await AxiosManager.post<BaseRes>('/ingame/register', data);
  return res.data;
};

export const ingameApi = async (): Promise<BaseRes> => {
  const res = await AxiosManager.get<BaseRes>('/ingame/userdata');
  return res.data;
};
