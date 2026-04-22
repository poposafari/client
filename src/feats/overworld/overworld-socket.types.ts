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
}

export interface GameTimeChangedPayload {
  timeOfDay?: string;
  startedAt?: number;
  duration?: number;
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

export const MOVE_TYPE_DURATION_MS: Record<string, number> = {
  walk: 288,
  running: 144,
  ride: 96,
  surf: 144,
  jump: 384, // 점프는 총 2타일 이동이므로 384ms
};
export const DEFAULT_MOVE_DURATION_MS = 288;
