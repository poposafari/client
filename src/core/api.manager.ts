import axios, { AxiosError, AxiosInstance } from 'axios';
import i18next from 'i18next';
import { ApiError, ErrorCode } from '@poposafari/types';
import {
  CostumeEntry,
  CreateUserReq,
  GameConnectRes,
  GetMeRes,
  GetUserRes,
  ItemBagItem,
  LoginLocalReq,
  BoxMetaItem,
  NicknameChange,
  OnlineCountRes,
  PcSlotState,
  PokedexEntry,
  PokemonBoxItem,
  RegisterLocalReq,
  RestoreFossilRes,
  SafariTicketStatusRes,
  SafariTicketClaimRes,
  SafariBaitRockRes,
  SafariCatchRes,
  TownMapEntry,
} from '@poposafari/types/dto';
import { SafariMapInfo, SafariWildInfo, SafariItemInfo } from '@poposafari/scenes';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailBody {
  statusCode: number;
  code: string;
  error: string;
  message: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; status: number } };

export class ApiManager {
  private client: AxiosInstance;
  private onSessionInvalid: (() => void) | null = null;
  private onMaintenance: (() => void) | null = null;
  private onRequestStart: (() => void) | null = null;
  private onRequestEnd: (() => void) | null = null;
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

  setOnSessionInvalid(handler: (() => void) | null) {
    this.onSessionInvalid = handler;
  }

  setOnMaintenance(handler: (() => void) | null) {
    this.onMaintenance = handler;
  }

  setOnRequestStart(handler: (() => void) | null) {
    this.onRequestStart = handler;
  }

  setOnRequestEnd(handler: (() => void) | null) {
    this.onRequestEnd = handler;
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        this.onRequestStart?.();
        // await new Promise((r) => setTimeout(r, 2000));
        return config;
      },
      (error) => {
        this.onRequestEnd?.();
        return Promise.reject(error);
      },
    );

    this.client.interceptors.response.use(
      (response) => {
        this.onRequestEnd?.();
        return response;
      },
      (error: AxiosError<ApiFailBody>) => {
        this.onRequestEnd?.();
        if (error.response?.status === 503 && this.onMaintenance) {
          this.onMaintenance();
        }
        const code = error.response?.data?.code;
        if (
          (code === ErrorCode.SESSION_EXPIRED || code === ErrorCode.SESSION_MISSING) &&
          this.onSessionInvalid
        ) {
          this.onSessionInvalid();
        }
        return this.handleGlobalError(error);
      },
    );
  }

  async checkSession(): Promise<boolean> {
    try {
      await this.client.get<ApiResponse<null>>('/sessions/current');
      return true;
    } catch {
      return false;
    }
  }

  async loginLocal(username: string, password: string): Promise<void> {
    const payload: LoginLocalReq = { username, password };
    await this.client.post<ApiResponse<null>>('/sessions', payload);
  }

  async registerLocal(username: string, password: string): Promise<void> {
    const payload: RegisterLocalReq = { username, password };
    await this.client.post<ApiResponse<null>>('/accounts', payload);
  }

  async getMe(): Promise<GetMeRes | null> {
    const res = await this.client.get<ApiResponse<GetMeRes>>('/users/me');

    if (res.data.success) {
      return res.data.data;
    }

    return null;
  }

  async getPokemonBox(): Promise<PokemonBoxItem[] | null> {
    const res = await this.client.get<ApiResponse<PokemonBoxItem[]>>('/users/me/pokemons');
    return res.data.success ? res.data.data : null;
  }

  async patchPokemonArrange(
    changes: PcSlotState[],
    boxMeta?: BoxMetaItem[],
    nicknames?: NicknameChange[],
  ): Promise<boolean> {
    const res = await this.client.patch<ApiResponse<null>>('/users/me/pokemons', {
      changes,
      ...(boxMeta?.length ? { boxMeta } : {}),
      ...(nicknames?.length ? { nicknames } : {}),
    });
    return res.data.success;
  }

  async getBoxMeta(): Promise<BoxMetaItem[] | null> {
    const res = await this.client.get<ApiResponse<BoxMetaItem[]>>('/users/me/boxes');
    return res.data.success ? res.data.data : null;
  }

  async sellPokemons(
    ids: number[],
  ): Promise<{ rewards: { itemId: string; quantity: number }[] } | null> {
    const res = await this.client.post<
      ApiResponse<{ rewards: { itemId: string; quantity: number }[] }>
    >('/users/me/pokemons/sell', { ids });
    return res.data.success ? res.data.data : null;
  }

  async enhancePokemon(
    id: number,
    candies: { itemId: string; count: number }[],
  ): Promise<{
    id: number;
    level: number;
    exp: number;
    expToNext: { current: number; next: number; remaining: number };
    leveledUp: boolean;
  } | null> {
    const res = await this.client.post<
      ApiResponse<{
        id: number;
        level: number;
        exp: number;
        expToNext: { current: number; next: number; remaining: number };
        leveledUp: boolean;
      }>
    >(`/users/me/pokemons/${id}/enhance`, { candies });
    return res.data.success ? res.data.data : null;
  }

  async upgradePokemon(id: number): Promise<{ id: number; tier: string } | null> {
    const res = await this.client.post<ApiResponse<{ id: number; tier: string }>>(
      `/users/me/pokemons/${id}/upgrade`,
    );
    return res.data.success ? res.data.data : null;
  }

  async evolvePokemon(
    id: number,
    cost: string,
  ): Promise<{ id: number; pokedexId: string; tier: string | null } | null> {
    const res = await this.client.post<
      ApiResponse<{ id: number; pokedexId: string; tier: string | null }>
    >(`/users/me/pokemons/${id}/evolve`, { cost });
    return res.data.success ? res.data.data : null;
  }

  async learnMove(id: number, move: string): Promise<{ id: number; skills: string[] } | null> {
    const res = await this.client.post<ApiResponse<{ id: number; skills: string[] }>>(
      `/users/me/pokemons/${id}/moves`,
      { move },
    );
    return res.data.success ? res.data.data : null;
  }

  async getItemBag(): Promise<ItemBagItem[] | null> {
    const res = await this.client.get<ApiResponse<ItemBagItem[]>>('/users/me/items');
    return res.data.success ? res.data.data : null;
  }

  async giveHold(
    userPokemonId: number,
    heldItem: string,
  ): Promise<{ pokemonId: number; heldItem: string; previousHeld: string | null } | null> {
    const res = await this.client.put<
      ApiResponse<{ pokemonId: number; heldItem: string; previousHeld: string | null }>
    >(`/users/me/pokemons/${userPokemonId}/held-item`, { heldItem });
    return res.data.success ? res.data.data : null;
  }

  async takeHeldItem(id: number): Promise<{ pokemonId: number; returnedItem: string } | null> {
    const res = await this.client.delete<ApiResponse<{ pokemonId: number; returnedItem: string }>>(
      `/users/me/pokemons/${id}/held-item`,
    );
    return res.data.success ? res.data.data : null;
  }

  async setItemRegister(
    itemId: string,
    register: boolean,
  ): Promise<{ itemId: string; quantity: number; register: boolean } | null> {
    const res = await this.client.patch<
      ApiResponse<{ itemId: string; quantity: number; register: boolean }>
    >(`/users/me/items/${itemId}`, { register });
    return res.data.success ? res.data.data : null;
  }

  async buyItem(
    item: string,
    quantity: number,
  ): Promise<{
    money: number;
    item: { itemId: string; quantity: number; register: boolean };
  } | null> {
    const res = await this.client.post<
      ApiResponse<{ money: number; item: { itemId: string; quantity: number; register: boolean } }>
    >(`/users/me/items/${item}/buy`, { quantity });
    return res.data.success ? res.data.data : null;
  }

  async sellItem(item: string, quantity: number): Promise<{ money: number } | null> {
    const res = await this.client.post<ApiResponse<{ money: number }>>(
      `/users/me/items/${item}/sell`,
      { quantity },
    );
    return res.data.success ? res.data.data : null;
  }

  async getSafariTicketStatus(): Promise<SafariTicketStatusRes | null> {
    const res =
      await this.client.get<ApiResponse<SafariTicketStatusRes>>('/users/me/safari-ticket');
    return res.data.success ? res.data.data : null;
  }

  async claimSafariTicket(): Promise<SafariTicketClaimRes | null> {
    const res = await this.client.post<ApiResponse<SafariTicketClaimRes>>(
      '/users/me/safari-ticket/claim',
    );
    return res.data.success ? res.data.data : null;
  }

  async getPokedex(): Promise<PokedexEntry[] | null> {
    const res = await this.client.get<ApiResponse<PokedexEntry[]>>('/users/me/pokedex');
    return res.data.success ? res.data.data : null;
  }

  async getTownMap(): Promise<TownMapEntry[] | null> {
    const res = await this.client.get<ApiResponse<TownMapEntry[]>>('/users/me/visited-maps');
    return res.data.success ? res.data.data : null;
  }

  async getCostumeList(): Promise<CostumeEntry[] | null> {
    const res = await this.client.get<ApiResponse<CostumeEntry[]>>('/users/me/costumes');
    return res.data.success ? res.data.data : null;
  }

  async gameConnect(): Promise<GameConnectRes> {
    const res = await this.client.post<ApiResponse<GameConnectRes>>('/game/connections');
    if (res.data.success) {
      return res.data.data;
    }
    throw new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to connect game', 500);
  }

  async getOnlineCount(): Promise<OnlineCountRes> {
    const res = await this.client.get<ApiResponse<OnlineCountRes>>('/game/online-count');
    if (res.data.success) {
      return res.data.data;
    }
    return { count: 0 };
  }

  async logout(): Promise<void> {
    await this.client.post<ApiResponse<null>>('/auth/logout');
  }

  async invalidateSession(): Promise<void> {
    await this.client.post<ApiResponse<null>>('/auth/invalidate-session');
  }

  async deleteAccount(): Promise<void> {
    await this.client.delete('/accounts/me');
  }

  async createUser(avatar: CreateUserReq): Promise<GetUserRes | null> {
    const res = await this.client.post<ApiResponse<GetUserRes>>('/users', avatar);

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
    >('/safari/enter', { mapId, needEntry });
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
      `/safari/items/${uid}/pick`,
    );
    return res.data.success ? res.data.data : null;
  }

  async safariCatch(uid: string): Promise<SafariCatchRes | null> {
    const res = await this.client.post<ApiResponse<SafariCatchRes>>(`/safari/wilds/${uid}/catch`);
    return res.data.success ? res.data.data : null;
  }

  /** FEED: 베잇 투척. 서버는 flee 확률만 계산 후 {result:'flee'|'stay'} 반환. */
  async safariBait(uid: string): Promise<SafariBaitRockRes | null> {
    const res = await this.client.post<ApiResponse<SafariBaitRockRes>>(`/safari/wilds/${uid}/bait`);
    return res.data.success ? res.data.data : null;
  }

  /** MUD: 진흙 투척. 서버는 flee 확률만 계산 후 {result:'flee'|'stay'} 반환. */
  async safariRock(uid: string): Promise<SafariBaitRockRes | null> {
    const res = await this.client.post<ApiResponse<SafariBaitRockRes>>(`/safari/wilds/${uid}/rock`);
    return res.data.success ? res.data.data : null;
  }

  async restoreFossil(id: number): Promise<RestoreFossilRes | null> {
    const res = await this.client.post<ApiResponse<RestoreFossilRes>>(
      `/users/me/fossils/${id}/restore`,
    );
    return res.data.success ? res.data.data : null;
  }

  async exitSafari(): Promise<{ mapId: string; entry: { x: number; y: number } } | null> {
    const res =
      await this.client.post<ApiResponse<{ mapId: string; entry: { x: number; y: number } }>>(
        '/safari/exit',
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

      if (errData?.code) {
        code = errData.code;
      }

      // i18n 키가 있으면 매핑된 메시지, 없으면 서버가 보내 준 원본 메시지(DEV 환경) 또는 기본값
      const i18nKey = `error:${code}`;
      if (i18next.exists(i18nKey)) {
        message = i18next.t(i18nKey);
      } else if (errData?.message) {
        message = errData.message;
      }
    } else if (error.request) {
      code = ErrorCode.NETWORK_ERROR;
      message = i18next.t('error:NETWORK_ERROR');
    } else {
      message = error.message;
    }

    if (status === 429) {
      const retryAfter = Number((error.response?.data as any)?.retryAfter) || 5;
      message = i18next.t('error:EXCEED_REQUEST', { minutes: retryAfter });
    }

    return Promise.reject(new ApiError(code, message, status));
  }
}
