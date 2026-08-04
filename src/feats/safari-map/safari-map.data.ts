import { TEXTURE } from '@poposafari/types';

export const ISLAND_SCALE = 4.8;
export const ISLAND_OFFSET_X = -25;
export const ISLAND_OFFSET_Y = +30;

export const POINT_SCALE = 1.8;

export const EDGE_COLOR = 0xf8b830;
export const EDGE_WIDTH = 6;

export type MapPointType = 0 | 1;

export interface MapPoint {
  key: string;
  x: number;
  y: number;
  type: MapPointType;
}

export const POINT_TEXTURES: Record<MapPointType, { base: TEXTURE; sel: TEXTURE }> = {
  0: { base: TEXTURE.MAP_POINT_0, sel: TEXTURE.MAP_POINT_0_SEL },
  1: { base: TEXTURE.MAP_POINT_1, sel: TEXTURE.MAP_POINT_1_SEL },
};

export const MAP_LOCATION_TO_POINT: Record<string, string> = {
  s001: 's001',
  s002: 's002',
  s003: 's003',
  s004: 's004',
  s005: 's005',
  s006: 's006',
  s007: 's007',
  s008: 's008',
  s009: 's008',
  s010: 's008',
  s011: 's008',
  s012: 's012',
  s013: 's013',
  s014: 's014',
  s015: 's015',
  s016: 's015',
  s017: 's017',
  s018: 's015',
  s019: 's019',
  s020: 's015',
  s021: 's021',
  s022: 's022',
  s023: 's023',
  s024: 's024',
  s025: 's024',
  s026: 's024',
  s027: 's024',
  s028: 's024',
  s029: 's024',
  s030: 's024',
  s031: 's024',
  s032: 's032',
  s033: 's032',
  s034: 's032',
  s035: 's032',
  s036: 's032',
  s037: 's032',
  s038: 's032',
  s039: 's039',
  s040: 's040',
  s041: 's041',
  s042: 's042',
  s043: 's042',
  s044: 's042',
  s045: 's042',
  s046: 's046',
};

export const POINT_TO_MAPS: Record<string, string[]> = {};
for (const [mapId, pointKey] of Object.entries(MAP_LOCATION_TO_POINT)) {
  (POINT_TO_MAPS[pointKey] ??= []).push(mapId);
}

export const EDGES: [string, string][] = [
  ['s046', 's001'],
  ['s001', 's002'],
  ['s002', 's003'],
  ['s003', 's004'],
  ['s004', 's005'],
  ['s004', 's006'],
  ['s006', 's007'],
  ['s006', 's008'],
  ['s008', 's012'],
  ['s003', 's013'],
  ['s013', 's014'],
  ['s014', 's015'],
  ['s015', 's017'],
  ['s017', 's019'],
  ['s019', 's021'],
  ['s021', 's022'],
  ['s021', 's023'],
  ['s023', 's024'],
  ['s013', 's032'],
  ['s032', 's039'],
  ['s039', 's040'],
  ['s040', 's041'],
  ['s040', 's042'],
];

export const MAP_POINTS: MapPoint[] = [
  { key: 's046', x: -140, y: 370, type: 0 },
  { key: 's001', x: -140, y: 300, type: 0 },
  { key: 's002', x: -110, y: 230, type: 0 },
  { key: 's003', x: -110, y: 160, type: 0 },
  { key: 's004', x: -180, y: 140, type: 0 },
  { key: 's005', x: -180, y: 200, type: 0 },
  { key: 's006', x: -250, y: 140, type: 0 },
  { key: 's007', x: -320, y: 140, type: 0 },
  { key: 's008', x: -260, y: 70, type: 1 },
  { key: 's012', x: -260, y: 0, type: 0 },
  { key: 's013', x: -40, y: 160, type: 0 },
  { key: 's014', x: 30, y: 160, type: 0 },
  { key: 's015', x: 50, y: 70, type: 1 },
  { key: 's017', x: -60, y: 50, type: 0 },
  { key: 's019', x: -90, y: -90, type: 0 },
  { key: 's021', x: -50, y: -140, type: 0 },
  { key: 's022', x: -50, y: -200, type: 0 },
  { key: 's023', x: -10, y: -100, type: 0 },
  { key: 's024', x: 40, y: -100, type: 1 },
  { key: 's032', x: 100, y: 160, type: 1 },
  { key: 's039', x: 170, y: 160, type: 0 },
  { key: 's040', x: 240, y: 140, type: 0 },
  { key: 's041', x: 230, y: 90, type: 1 },
  { key: 's042', x: 250, y: 190, type: 1 },
];

export interface MapPointTransform {
  x: (x: number) => number;
  y: (y: number) => number;
}

export function drawMapEdges(
  graphics: Phaser.GameObjects.Graphics,
  transform?: MapPointTransform,
): void {
  graphics.clear();
  graphics.lineStyle(EDGE_WIDTH, EDGE_COLOR, 1);
  const byKey = new Map(MAP_POINTS.map((p) => [p.key, p]));
  const tx = transform?.x ?? ((x: number) => x);
  const ty = transform?.y ?? ((y: number) => y);
  for (const [a, b] of EDGES) {
    const pa = byKey.get(a);
    const pb = byKey.get(b);
    if (!pa || !pb) continue;
    graphics.lineBetween(tx(pa.x), ty(pa.y), tx(pb.x), ty(pb.y));
  }
}
