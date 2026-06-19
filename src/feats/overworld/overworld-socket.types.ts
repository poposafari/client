import type { SafariWildInfo } from '@poposafari/scenes';
import { MOVEMENT_SPEED, TILE_MOVE_BASE_MS } from './overworld.constants';

export interface PetState {
  pokedexId: string;
  isShiny: boolean;
}

export interface RoomUserState {
  userId: string;
  mapId: string;
  x: string;
  y: string;
  nickname: string;
  costume?: string;
  socketId?: string;
  gender?: string;
  pet?: string | PetState | null;
  createdAt?: string;
  lastMoveTime?: string;
}

/** 내 펫 상태 변화를 서버에 알림 */
export interface PetChangePayload {
  pokedexId: string | null;
  isShiny: boolean;
}

/** 같은 맵의 다른 유저 펫 상태 변화 수신 */
export interface OtherPetChangedPayload {
  userId: string;
  pokedexId: string | null;
  isShiny: boolean;
}

export interface InitOkPayload {
  userId: string;
  nickname: string;
  gender?: string;
  lastLocation?: { map: string; x: number; y: number };
  timeOfDay?: string;
  gameTimeStartedAt?: number;
  gameTimeDuration?: number;
  weather?: string;
  weatherStartedAt?: number;
  weatherDuration?: number;
}

export interface ChangeMapOkPayload {
  mapId: string;
  x: number;
  y: number;
  weather?: string;
  weatherStartedAt?: number;
  weatherDuration?: number;
}

export interface GameTimeChangedPayload {
  timeOfDay?: string;
  startedAt?: number;
  duration?: number;
}

export interface WeatherChangedPayload {
  mapId: string;
  weather: string;
  startedAt: number;
  duration: number;
}

export interface MovePayload {
  direction: 'up' | 'down' | 'left' | 'right';
  moveType?: 'walk' | 'running' | 'ride' | 'surf' | 'jump';
}

export interface UserMovedPayload {
  userId: string;
  x: number;
  y: number;
  direction: string;
  moveType?: string;
  lastMoveTime?: string;
}

/** Tick 기반: 서버가 주기적으로 방 단위로 보내는 이동 배치 */
export interface UsersMovedPayload {
  updates: UserMovedPayload[];
}

export interface WildSpawnPayload {
  mapId: string;
  wild: SafariWildInfo;
}

export type WildDespawnReason = 'ttl' | 'caught' | 'fled' | 'exit';

export interface WildDespawnPayload {
  mapId: string;
  wildUid: string;
  reason: WildDespawnReason;
}

export const MOVE_TYPE_DURATION_MS: Record<string, number> = Object.fromEntries(
  Object.entries(MOVEMENT_SPEED).map(([moveType, speed]) => [
    moveType,
    Math.round((TILE_MOVE_BASE_MS / speed) * (moveType === 'jump' ? 2 : 1)),
  ]),
);
export const DEFAULT_MOVE_DURATION_MS = MOVE_TYPE_DURATION_MS.walk;
