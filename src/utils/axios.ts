import axios from 'axios';

interface AccountReq {
  username: string;
  password: string;
}

interface BaseRes {
  result: string;
}

const AxiosManager = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerApi = async (data: AccountReq): Promise<BaseRes> => {
  const res = await AxiosManager.post<BaseRes>('/account/register', data);
  return res.data;
};
