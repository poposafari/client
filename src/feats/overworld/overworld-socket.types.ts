export interface RoomUserState {
  userId: string;
  mapId: string;
  x: string;
  y: string;
  nickname: string;
  costume?: string;
  socketId?: string;
  gender?: string;
  pet?: string;
  createdAt?: string;
  lastMoveTime?: string;
}

export interface InitOkPayload {
  userId: string;
  nickname: string;
  gender?: string;
  lastLocation?: { map: string; x: number; y: number };
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

export const MOVE_TYPE_DURATION_MS: Record<string, number> = {
  walk: 288,
  running: 144,
  ride: 96,
  surf: 144,
  jump: 384, // 점프는 총 2타일 이동이므로 384ms
};
export const DEFAULT_MOVE_DURATION_MS = 288;
