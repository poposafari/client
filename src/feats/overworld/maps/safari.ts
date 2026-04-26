import { MapConfig } from '@poposafari/core/map.registry';
import { DEPTH, TILE } from '@poposafari/types';
import { DOOR, INIT_POS } from './door';

export const s001Config: MapConfig = {
  key: 's001',
  isIndoor: false,
  area: { land: 'field', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  allowRide: true,
  tilesets: [
    TILE.OUTDOOR_FLOOR,
    TILE.OUTDOOR_OBJECT,
    TILE.OUTDOOR_EDGE,
    TILE.OUTDOOR_OBJECT_URBAN,
    TILE.OUTDOOR_URBAN,
    TILE.OUTDOOR_EVENT,
  ],
  layers: [
    { idx: 0, texture: TILE.OUTDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.OUTDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.OUTDOOR_EDGE, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.OUTDOOR_EDGE, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.OUTDOOR_URBAN, depth: DEPTH.GROUND + 4 },
    { idx: 5, texture: TILE.OUTDOOR_URBAN, depth: DEPTH.GROUND + 5 },
    { idx: 6, texture: TILE.OUTDOOR_OBJECT, depth: DEPTH.GROUND + 6 },
    { idx: 7, texture: TILE.OUTDOOR_OBJECT, depth: DEPTH.GROUND + 7 },
    { idx: 8, texture: TILE.OUTDOOR_OBJECT_URBAN, depth: DEPTH.GROUND + 8 },
    { idx: 9, texture: TILE.OUTDOOR_OBJECT_URBAN, depth: DEPTH.GROUND + 9 },
    { idx: 10, texture: TILE.OUTDOOR_EVENT, depth: DEPTH.GROUND + 10 },
  ],
  foreground: [
    {
      idx: 11,
      texture: [TILE.OUTDOOR_OBJECT_URBAN, TILE.OUTDOOR_OBJECT],
      depth: DEPTH.FOREGROUND,
    },
    {
      idx: 12,
      texture: [TILE.OUTDOOR_OBJECT_URBAN, TILE.OUTDOOR_OBJECT],
      depth: DEPTH.FOREGROUND,
    },
  ],

  doors: [
    { startId: DOOR.S001_RIGHT_0, destId: INIT_POS.S002_DOWN_0 },
    { startId: DOOR.S001_RIGHT_1, destId: INIT_POS.S002_DOWN_1 },
    { startId: DOOR.S001_RIGHT_2, destId: INIT_POS.S002_DOWN_2 },
  ],

  npcs: [],
};

export const s002Config: MapConfig = {
  key: 's002',
  isIndoor: false,
  area: { land: 'field', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  allowRide: true,
  tilesets: [
    TILE.OUTDOOR_FLOOR,
    TILE.OUTDOOR_OBJECT,
    TILE.OUTDOOR_EDGE,
    TILE.OUTDOOR_OBJECT_URBAN,
    TILE.OUTDOOR_URBAN,
    TILE.OUTDOOR_EVENT,
  ],
  layers: [
    { idx: 0, texture: TILE.OUTDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.OUTDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.OUTDOOR_EDGE, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.OUTDOOR_EDGE, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.OUTDOOR_URBAN, depth: DEPTH.GROUND + 4 },
    { idx: 5, texture: TILE.OUTDOOR_URBAN, depth: DEPTH.GROUND + 5 },
    { idx: 6, texture: TILE.OUTDOOR_OBJECT, depth: DEPTH.GROUND + 6 },
    { idx: 7, texture: TILE.OUTDOOR_OBJECT, depth: DEPTH.GROUND + 7 },
    { idx: 8, texture: TILE.OUTDOOR_OBJECT_URBAN, depth: DEPTH.GROUND + 8 },
    { idx: 9, texture: TILE.OUTDOOR_OBJECT_URBAN, depth: DEPTH.GROUND + 9 },
    { idx: 10, texture: TILE.OUTDOOR_EVENT, depth: DEPTH.GROUND + 10 },
  ],
  foreground: [
    {
      idx: 11,
      texture: [TILE.OUTDOOR_OBJECT_URBAN, TILE.OUTDOOR_OBJECT],
      depth: DEPTH.FOREGROUND,
    },
    {
      idx: 12,
      texture: [TILE.OUTDOOR_OBJECT_URBAN, TILE.OUTDOOR_OBJECT],
      depth: DEPTH.FOREGROUND,
    },
  ],

  doors: [
    { startId: DOOR.S002_DOWN_0, destId: INIT_POS.S001_RIGHT_0 },
    { startId: DOOR.S002_DOWN_1, destId: INIT_POS.S001_RIGHT_1 },
    { startId: DOOR.S002_DOWN_2, destId: INIT_POS.S001_RIGHT_2 },
    { startId: DOOR.S002_UP_0, destId: INIT_POS.S003_DOWN_0 },
    { startId: DOOR.S002_UP_1, destId: INIT_POS.S003_DOWN_1 },
  ],

  npcs: [],
};

export const s003Config: MapConfig = {
  key: 's003',
  isIndoor: false,
  area: { land: 'field', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  allowRide: true,
  tilesets: [
    TILE.OUTDOOR_FLOOR,
    TILE.OUTDOOR_OBJECT,
    TILE.OUTDOOR_EDGE,
    TILE.OUTDOOR_OBJECT_URBAN,
    TILE.OUTDOOR_URBAN,
    TILE.OUTDOOR_EVENT,
  ],
  layers: [
    { idx: 0, texture: TILE.OUTDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.OUTDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.OUTDOOR_EDGE, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.OUTDOOR_EDGE, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.OUTDOOR_URBAN, depth: DEPTH.GROUND + 4 },
    { idx: 5, texture: TILE.OUTDOOR_URBAN, depth: DEPTH.GROUND + 5 },
    { idx: 6, texture: TILE.OUTDOOR_OBJECT, depth: DEPTH.GROUND + 6 },
    { idx: 7, texture: TILE.OUTDOOR_OBJECT, depth: DEPTH.GROUND + 7 },
    { idx: 8, texture: TILE.OUTDOOR_OBJECT_URBAN, depth: DEPTH.GROUND + 8 },
    { idx: 9, texture: TILE.OUTDOOR_OBJECT_URBAN, depth: DEPTH.GROUND + 9 },
    { idx: 10, texture: TILE.OUTDOOR_EVENT, depth: DEPTH.GROUND + 10 },
  ],
  foreground: [
    {
      idx: 11,
      texture: [TILE.OUTDOOR_OBJECT_URBAN, TILE.OUTDOOR_OBJECT],
      depth: DEPTH.FOREGROUND,
    },
    {
      idx: 12,
      texture: [TILE.OUTDOOR_OBJECT_URBAN, TILE.OUTDOOR_OBJECT],
      depth: DEPTH.FOREGROUND,
    },
  ],

  doors: [
    { startId: DOOR.S003_DOWN_0, destId: INIT_POS.S002_UP_0 },
    { startId: DOOR.S003_DOWN_1, destId: INIT_POS.S002_UP_1 },
  ],

  npcs: [],
};
