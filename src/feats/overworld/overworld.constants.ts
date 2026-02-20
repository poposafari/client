/**
 * 오버월드 타일 좌표 계산 (레거시 TILE_SIZE, MAP_SCALE 대응).
 * 맵 scale=3 기준 한 타일 = TILE_PIXEL 픽셀.
 */

export const TILE_BASE = 16;
export const MAP_LAYER_SCALE = 3;
export const TILE_PIXEL = TILE_BASE * MAP_LAYER_SCALE;

/** 오버월드 시각 줌 (Container scale, setZoom 대신 사용). */
export const OVERWORLD_ZOOM = 1.6;
/** 맵 레이어 시각 스케일: TilemapLayer는 Container scale을 따르지 않으므로 맵만 이 스케일로 그린다. */
export const MAP_LAYER_SCALE_ZOOMED = MAP_LAYER_SCALE * OVERWORLD_ZOOM;

/** 타일 좌표 → 월드 픽셀 (타일 가로 중심, 타일 세로 바닥). 원점 (0,0) 기준. */
export function calcOverworldTilePos(tileX: number, tileY: number): [number, number] {
  const x = tileX * TILE_PIXEL + TILE_PIXEL / 2;
  const y = tileY * TILE_PIXEL + TILE_PIXEL;
  return [Math.round(x), Math.round(y)];
}

export enum DIRECTION {
  NONE = 'none',
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

const DIRECTION_DELTA: Record<DIRECTION, { dx: number; dy: number }> = {
  [DIRECTION.NONE]: { dx: 0, dy: 0 },
  [DIRECTION.UP]: { dx: 0, dy: -1 },
  [DIRECTION.DOWN]: { dx: 0, dy: 1 },
  [DIRECTION.LEFT]: { dx: -1, dy: 0 },
  [DIRECTION.RIGHT]: { dx: 1, dy: 0 },
};

export function directionToDelta(d: DIRECTION): { dx: number; dy: number } {
  return DIRECTION_DELTA[d] ?? { dx: 0, dy: 0 };
}
