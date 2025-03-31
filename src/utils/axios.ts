import axios from 'axios';

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

export const registerApi = async (data: AccountReq): Promise<BaseRes> => {
  const res = await AxiosManager.post<BaseRes>('/account/register', data);
  return res.data;
};

export const loginApi = async (data: AccountReq): Promise<BaseRes> => {
  const res = await AxiosManager.post<BaseRes>('/account/login', data);
  return res.data;
};

export const nicknameApi = async (data: NicknameReq): Promise<BaseRes> => {
  const res = await AxiosManager.post<BaseRes>('/ingame/register', data);
  return res.data;
};

export const ingameApi = async (data: any): Promise<BaseRes> => {
  const res = await AxiosManager.get<BaseRes>('/ingame/userdata');
  return res.data;
};
