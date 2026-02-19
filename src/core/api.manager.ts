import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import i18next from 'i18next';
import { BaseUi, IInputHandler, InputManager } from '@poposafari/core';
import {
  ApiError,
  DEPTH,
  ErrorCode,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
  UserPokemon,
} from '@poposafari/types';
import { addText, addWindow } from '@poposafari/utils';
import {
  CreateUserReq,
  GetStartingPokemonsRes,
  GetUserRes,
  LoginLocalReq,
  RegisterLocalReq,
  StartingPokemon,
} from '@poposafari/types/dto';
import { GameScene } from '@poposafari/scenes';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFail {
  success: false;
  error: {
    code: ErrorCode;
    message: string | null;
    status: number;
  };
}

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; status: number } };

export class ApiManager {
  private client: AxiosInstance;
  private static readonly TIMEOUT = 10000;
  private isRefreshing = false;

  constructor(private baseUrl: string = 'http://localhost:9000/api') {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: ApiManager.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiFail>) => {
        const originalRequest = error.config as CustomRequestConfig;

        // 서버 응답이 있고, 아직 재시도하지 않은 요청이 있다면?
        if (error.response?.data && !originalRequest._retry) {
          const errData = error.response.data;

          if (
            errData.error?.code === ErrorCode.AT_EXPIRED ||
            errData.error?.code === ErrorCode.AT_MISSING
          ) {
            originalRequest._retry = true; // 재시도 플래그 설정

            try {
              const newToken = await this.autoLoginOrRefresh();
              localStorage.setItem('accessToken', newToken);

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }

              return this.client(originalRequest);
            } catch (refreshError) {
              this.clearSession();
              return Promise.reject(refreshError);
            }
          }
        }

        // 그 외 에러는 공통 핸들러로 전달
        return this.handleGlobalError(error);
      },
    );
  }

  private async autoLoginOrRefresh() {
    const res = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${this.baseUrl}/auth/refresh`,
      {},
      {
        withCredentials: true,
      },
    );

    if (res.data.success) {
      const { accessToken } = res.data.data;

      return res.data.data.accessToken;
    } else {
      throw new Error('Failed to refresh token');
    }
  }

  async loginLocal(username: string, password: string): Promise<void> {
    const payload: LoginLocalReq = { username, password };
    const res = await this.client.post<ApiResponse<{ accessToken: string }>>(
      '/auth/login/local',
      payload,
    );

    if (res.data.success) {
      const { accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
    }
  }

  async registerLocal(username: string, password: string): Promise<void> {
    const payload: RegisterLocalReq = { username, password };
    const res = await this.client.post<ApiResponse<{ accessToken: string }>>(
      '/auth/register/local',
      payload,
    );

    if (res.data.success) {
      const { accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
    }
  }

  async getUser(): Promise<GetUserRes | null> {
    const res = await this.client.get<ApiResponse<GetUserRes>>('/user/get');

    if (res.data.success) {
      return res.data.data;
    }

    return null;
  }

  async logout(): Promise<void> {
    const res = await this.client.post<ApiResponse<null>>('/auth/logout');

    if (res.data.success) {
      this.clearSession();
    }
  }

  async deleteAccount(): Promise<void> {
    const res = await this.client.delete<ApiResponse<null>>('/auth/delete');

    if (res.data.success) {
      this.clearSession();
    }
  }

  async createUser(avatar: CreateUserReq): Promise<GetUserRes | null> {
    const res = await this.client.post<ApiResponse<GetUserRes>>('/user/create', avatar);

    if (res.data.success) {
      return res.data.data;
    }

    return null;
  }

  async getStartingPokemons(): Promise<StartingPokemon[] | null> {
    const res = await this.client.get<ApiResponse<GetStartingPokemonsRes>>('/game/starting');

    if (res.data.success) {
      return res.data.data.list || [];
    }

    return null;
  }

  async pickStartingPokemon(index: number): Promise<UserPokemon | null> {
    const res = await this.client.post<ApiResponse<null>>('/game/starting/catch', { index });

    if (res.data.success) {
      return res.data.data;
    }

    return null;
  }

  private handleGlobalError(error: AxiosError<ApiFail>) {
    let code: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = i18next.t('error:unkown');
    let status = 500;

    if (error.response) {
      status = error.response.status;
      const errData = error.response.data;

      if (errData && !errData.success && errData.error) {
        code = errData.error.code;
      }

      switch (code) {
        case ErrorCode.INTERNAL_SERVER_ERROR:
          message = i18next.t('error:intervalServer');
          break;
        case ErrorCode.NOT_FOUND:
          message = i18next.t('error:notFound');
          break;
        case ErrorCode.DTO_INVALID:
          message = i18next.t('error:invalidDTO');
          break;
        case ErrorCode.USER_NOT_FOUND:
        case ErrorCode.RT_MISSING:
          message = i18next.t('error:sessionExpired');
          break;
        case ErrorCode.USER_ALREADY_EXISTS:
          message = i18next.t('error:userAlreadyExist');
          break;
        case ErrorCode.FAILED_LOGIN:
          message = i18next.t('error:invalidUsernameOrPassword');
          break;
        case ErrorCode.USER_ALREADY_DELETED:
          message = i18next.t('error:userAlreadyDeleted');
          break;
      }
    } else if (error.request) {
      code = ErrorCode.NETWORK_ERROR;
      message = i18next.t('error:network');
    } else {
      message = error.message;
    }

    if (status === 429) {
      message = i18next.t('error:exceedTryLogin');
    }

    return Promise.reject(new ApiError(code, message, status));
  }

  clearSession() {
    localStorage.removeItem('accessToken');
  }
}

export class ApiBlockingUi extends BaseUi implements IInputHandler {
  scene: GameScene;

  private window!: GWindow;
  private text!: GText;
  private timerEvent: Phaser.Time.TimerEvent | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.API);

    this.scene = scene;
    this.createLayout();
  }

  onInput(key: string): void {}

  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  createLayout() {
    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      500,
      200,
      4,
      16,
      16,
      16,
      16,
    );
    this.text = addText(
      this.scene,
      0,
      0,
      i18next.t('menu:loading'),
      70,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.add([this.window, this.text]);
  }

  public blockInput(delayMs: number = 0) {
    this.show();

    this.setVisible(false);

    if (delayMs > 0) {
      this.timerEvent = this.scene.time.delayedCall(delayMs, () => {
        this.setVisible(true);
      });
    } else {
      this.setVisible(true);
    }
  }

  public unblockInput() {
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
    this.hide();
  }
}
