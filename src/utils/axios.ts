import axios from 'axios';
import { ModeManager } from '../managers';
import { LoadingDefaultUi } from '../ui/loading-default-ui';
import { ItemCategory } from '../storage/bag';

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

interface ItemCategoryReq {
  category: ItemCategory;
}

interface ItemSlotReq {
  slot1: string | null;
  slot2: string | null;
  slot3: string | null;
  slot4: string | null;
  slot5: string | null;
  slot6: string | null;
  slot7: string | null;
  slot8: string | null;
  slot9: string | null;
}

const AxiosManager = axios.create({
  baseURL: 'https://localhost:443/api',
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
    return Promise.resolve(config);
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

export const logoutApi = async (): Promise<BaseRes> => {
  const res = await AxiosManager.get<BaseRes>('/account/logout');
  return res.data;
};

export const deleteAccountApi = async (): Promise<BaseRes> => {
  const res = await AxiosManager.get<BaseRes>('/account/delete');
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

export const getItemsApi = async (data: ItemCategoryReq): Promise<BaseRes> => {
  const res = await AxiosManager.post<BaseRes>('/bag/category', data);
  return res.data;
};

export const updateItemSlotApi = async (data: ItemSlotReq): Promise<BaseRes> => {
  const res = await AxiosManager.post<BaseRes>('ingame/itemslot/update', data);
  return res.data;
};

export const getAvailableTicketApi = async (): Promise<BaseRes> => {
  const res = await AxiosManager.get<BaseRes>('/ticket/get');
  return res.data;
};

export const receiveAvailableTicketApi = async (): Promise<BaseRes> => {
  const res = await AxiosManager.get<BaseRes>('/ticket/receive');
  return res.data;
};
