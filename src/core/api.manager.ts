import axios, { AxiosError, AxiosInstance } from 'axios';
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
  CostumeEntry,
  CreateUserReq,
  GetMeRes,
  GetStartingPokemonsRes,
  GetUserRes,
  ItemBagItem,
  LoginLocalReq,
  BoxMetaItem,
  NicknameChange,
  PcSlotState,
  PokedexEntry,
  PokemonBoxItem,
  RegisterLocalReq,
  SafariBaitReq,
  SafariBaitRockRes,
  SafariCatchReq,
  SafariCatchRes,
  SafariRockReq,
  StartingPokemon,
  TownMapEntry,
} from '@poposafari/types/dto';
import { GameScene, SafariMapInfo, SafariWildInfo, SafariItemInfo } from '@poposafari/scenes';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailBody {
  success: false;
  error: { code: string; message: string | null; status: number };
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; status: number } };

export class ApiManager {
  private client: AxiosInstance;
  private static readonly TIMEOUT = 10000;

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
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiFailBody>) => {
        const code = error.response?.data?.error?.code;
        if (code === ErrorCode.SESSION_MISSING || code === ErrorCode.SESSION_EXPIRED) {
          return Promise.reject(error);
        }

        return this.handleGlobalError(error);
      },
    );
  }

  async checkSession(): Promise<boolean> {
    try {
      await this.client.post<ApiResponse<null>>('/auth/check');
      return true;
    } catch {
      return false;
    }
  }

  async loginLocal(username: string, password: string): Promise<void> {
    const payload: LoginLocalReq = { username, password };
    await this.client.post<ApiResponse<null>>('/auth/login/local', payload);
  }

  async registerLocal(username: string, password: string): Promise<void> {
    const payload: RegisterLocalReq = { username, password };
    await this.client.post<ApiResponse<null>>('/auth/register/local', payload);
  }

  async getMe(): Promise<GetMeRes | null> {
    const res = await this.client.get<ApiResponse<GetMeRes>>('/user/me');

    if (res.data.success) {
      return res.data.data;
    }

    return null;
  }

  async getPokemonBox(): Promise<PokemonBoxItem[] | null> {
    const res = await this.client.get<ApiResponse<PokemonBoxItem[]>>('/pokemon/box');
    return res.data.success ? res.data.data : null;
  }

  async patchPokemonArrange(
    changes: PcSlotState[],
    boxMeta?: BoxMetaItem[],
    nicknames?: NicknameChange[],
  ): Promise<boolean> {
    const res = await this.client.patch<ApiResponse<null>>('/pokemon/box/arrange', {
      changes,
      ...(boxMeta?.length ? { boxMeta } : {}),
      ...(nicknames?.length ? { nicknames } : {}),
    });
    return res.data.success;
  }

  async getBoxMeta(): Promise<BoxMetaItem[] | null> {
    const res = await this.client.get<ApiResponse<BoxMetaItem[]>>('/pokemon/box/meta');
    return res.data.success ? res.data.data : null;
  }

  async sellPokemon(id: number): Promise<{ candyId: string; quantity: number } | null> {
    const res = await this.client.post<ApiResponse<{ candyId: string; quantity: number }>>(
      '/pokemon/sell',
      { id },
    );
    return res.data.success ? res.data.data : null;
  }

  async enhancePokemon(
    id: number,
    candy: number,
  ): Promise<{ id: number; level: number; candyId: string; candyRemaining: number } | null> {
    const res = await this.client.post<
      ApiResponse<{ id: number; level: number; candyId: string; candyRemaining: number }>
    >('/pokemon/enhance', { id, candy });
    return res.data.success ? res.data.data : null;
  }

  async evolvePokemon(
    id: number,
    cost: string,
  ): Promise<{ id: number; pokedexId: string } | null> {
    const res = await this.client.post<ApiResponse<{ id: number; pokedexId: string }>>(
      '/pokemon/evolve',
      { id, cost },
    );
    return res.data.success ? res.data.data : null;
  }

  async getItemBag(): Promise<ItemBagItem[] | null> {
    const res = await this.client.get<ApiResponse<ItemBagItem[]>>('/item/bag');
    return res.data.success ? res.data.data : null;
  }

  async getPokedex(): Promise<PokedexEntry[] | null> {
    const res = await this.client.get<ApiResponse<PokedexEntry[]>>('/pokedex');
    return res.data.success ? res.data.data : null;
  }

  async getTownMap(): Promise<TownMapEntry[] | null> {
    const res = await this.client.get<ApiResponse<TownMapEntry[]>>('/town-map');
    return res.data.success ? res.data.data : null;
  }

  async getCostumeList(): Promise<CostumeEntry[] | null> {
    const res = await this.client.get<ApiResponse<CostumeEntry[]>>('/costume');
    return res.data.success ? res.data.data : null;
  }

  async getConnToken(): Promise<string> {
    const res = await this.client.post<ApiResponse<{ token: string }>>('/game/connect');
    if (res.data.success) {
      return res.data.data.token;
    }
    throw new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to get connection token', 500);
  }

  async logout(): Promise<void> {
    await this.client.post<ApiResponse<null>>('/auth/logout');
  }

  async invalidateSession(): Promise<void> {
    await this.client.post<ApiResponse<null>>('/auth/invalidate-session');
  }

  async deleteAccount(): Promise<void> {
    await this.client.delete<ApiResponse<null>>('/auth/delete');
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

  async enterSafari(
    mapId: string,
    needEntry: boolean,
  ): Promise<{ mapId: string; mapInfo: SafariMapInfo } | null> {
    const res = await this.client.post<
      ApiResponse<{
        mapData: { wilds: SafariWildInfo[]; items: SafariItemInfo[] };
        entry?: { x: number; y: number };
      }>
    >('/game/safari/enter', { mapId, needEntry });
    if (!res.data.success || !res.data.data) return null;
    const { mapData, entry } = res.data.data;
    return {
      mapId,
      mapInfo: {
        wilds: mapData.wilds,
        items: mapData.items,
        entry: entry ?? null,
      },
    };
  }

  async pickGroundItem(uid: string): Promise<{ itemId: string; newQuantity: number } | null> {
    const res = await this.client.post<ApiResponse<{ itemId: string; newQuantity: number }>>(
      '/game/safari/pick-item',
      { uid },
    );
    return res.data.success ? res.data.data : null;
  }

  async safariCatch(payload: SafariCatchReq): Promise<SafariCatchRes | null> {
    const res = await this.client.post<ApiResponse<SafariCatchRes>>('/game/safari/catch', payload);
    return res.data.success ? res.data.data : null;
  }

  /** FEED: 베잇 투척. 서버는 flee 확률만 계산 후 {result:'flee'|'stay'} 반환. */
  async safariBait(payload: SafariBaitReq): Promise<SafariBaitRockRes | null> {
    const res = await this.client.post<ApiResponse<SafariBaitRockRes>>(
      '/game/safari/bait',
      payload,
    );
    return res.data.success ? res.data.data : null;
  }

  /** MUD: 진흙 투척. 서버는 flee 확률만 계산 후 {result:'flee'|'stay'} 반환. */
  async safariRock(payload: SafariRockReq): Promise<SafariBaitRockRes | null> {
    const res = await this.client.post<ApiResponse<SafariBaitRockRes>>(
      '/game/safari/rock',
      payload,
    );
    return res.data.success ? res.data.data : null;
  }

  async exitSafari(): Promise<{ mapId: string; entry: { x: number; y: number } } | null> {
    const res =
      await this.client.post<ApiResponse<{ mapId: string; entry: { x: number; y: number } }>>(
        '/game/safari/exit',
      );
    return res.data.success ? res.data.data : null;
  }

  private handleGlobalError(error: AxiosError<ApiFailBody>) {
    let code: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = i18next.t('error:INTERNAL_SERVER_ERROR');
    let status = 500;

    if (error.response) {
      status = error.response.status;
      const errData = error.response.data;

      if (errData?.error?.code) {
        code = errData.error.code;
      }

      // i18n 키가 있으면 매핑된 메시지, 없으면 서버가 보내 준 원본 메시지(DEV 환경) 또는 기본값
      const i18nKey = `error:${code}`;
      if (i18next.exists(i18nKey)) {
        message = i18next.t(i18nKey);
      } else if (errData?.error?.message) {
        message = errData.error.message;
      }
    } else if (error.request) {
      code = ErrorCode.NETWORK_ERROR;
      message = i18next.t('error:NETWORK_ERROR');
    } else {
      message = error.message;
    }

    if (status === 429) {
      message = i18next.t('error:EXCEED_REQUEST');
    }

    return Promise.reject(new ApiError(code, message, status));
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
