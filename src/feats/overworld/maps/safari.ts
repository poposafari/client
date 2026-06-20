import { MapConfig } from '@poposafari/core/map.registry';
import { BGM, DEPTH, TILE } from '@poposafari/types';
import { DOOR, INIT_POS } from './door';

export const s000Config: MapConfig = {
  key: 's000',
  bgm: BGM.S000,
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

  doors: [],

  npcs: [],
};

export const s001Config: MapConfig = {
  key: 's001',
  bgm: BGM.S001,
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
    { startId: DOOR.S001_DOWN_0, destId: INIT_POS.S046_UP_0 },
    { startId: DOOR.S001_DOWN_1, destId: INIT_POS.S046_UP_1 },
  ],

  npcs: [],
};

export const s002Config: MapConfig = {
  key: 's002',
  bgm: BGM.S002,
  isIndoor: false,
  area: { land: 'forest', water: 'water' },
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
  bgm: BGM.S003,
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
    { startId: DOOR.S003_LEFT_0, destId: INIT_POS.S004_RIGHT_0 },
    { startId: DOOR.S003_LEFT_1, destId: INIT_POS.S004_RIGHT_1 },
    { startId: DOOR.S003_LEFT_2, destId: INIT_POS.S004_RIGHT_1 },
    { startId: DOOR.S003_RIGHT_0, destId: INIT_POS.S013_LEFT_0 },
    { startId: DOOR.S003_RIGHT_1, destId: INIT_POS.S013_LEFT_0 },
    { startId: DOOR.S003_RIGHT_2, destId: INIT_POS.S013_LEFT_1 },
  ],

  npcs: [],
};

export const s004Config: MapConfig = {
  key: 's004',
  bgm: BGM.S004,
  isIndoor: false,
  area: { land: 'forest', water: 'water' },
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
    { startId: DOOR.S004_RIGHT_0, destId: INIT_POS.S003_LEFT_0 },
    { startId: DOOR.S004_RIGHT_1, destId: INIT_POS.S003_LEFT_1 },
    { startId: DOOR.S004_DOWN_0, destId: INIT_POS.S005_UP_0 },
    { startId: DOOR.S004_DOWN_1, destId: INIT_POS.S005_UP_1 },
    { startId: DOOR.S004_LEFT_0, destId: INIT_POS.S006_RIGHT_0 },
    { startId: DOOR.S004_LEFT_1, destId: INIT_POS.S006_RIGHT_1 },
    { startId: DOOR.S004_LEFT_2, destId: INIT_POS.S006_RIGHT_1 },
  ],

  npcs: [],
};

export const s005Config: MapConfig = {
  key: 's005',
  bgm: BGM.S005,
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
    { startId: DOOR.S005_UP_0, destId: INIT_POS.S004_DOWN_0 },
    { startId: DOOR.S005_UP_1, destId: INIT_POS.S004_DOWN_1 },
  ],

  npcs: [],
};

export const s006Config: MapConfig = {
  key: 's006',
  bgm: BGM.S006,
  isIndoor: false,
  area: { land: 'forest', water: 'water' },
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
    { startId: DOOR.S006_RIGHT_0, destId: INIT_POS.S004_LEFT_0 },
    { startId: DOOR.S006_RIGHT_1, destId: INIT_POS.S004_LEFT_1 },
    { startId: DOOR.S006_LEFT_0, destId: INIT_POS.S007_RIGHT_0 },
    { startId: DOOR.S006_LEFT_1, destId: INIT_POS.S007_RIGHT_1 },
    { startId: DOOR.S006_UP_0, destId: INIT_POS.S008_DOWN_0 },
  ],

  npcs: [],
};

export const s007Config: MapConfig = {
  key: 's007',
  bgm: BGM.S007,
  isIndoor: false,
  area: { land: 'forest', water: 'water' },
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
    { startId: DOOR.S007_RIGHT_0, destId: INIT_POS.S006_LEFT_0 },
    { startId: DOOR.S007_RIGHT_1, destId: INIT_POS.S006_LEFT_1 },
  ],

  npcs: [],
};

export const s008Config: MapConfig = {
  key: 's008',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S008_S011,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S008_DOWN_0, destId: INIT_POS.S006_UP_0 },
    { startId: DOOR.S008_LEFT_0, destId: INIT_POS.S009_RIGHT_0 },
    { startId: DOOR.S008_UP_0, destId: INIT_POS.S012_DOWN_0 },
  ],

  npcs: [],
};

export const s009Config: MapConfig = {
  key: 's009',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S008_S011,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S009_RIGHT_0, destId: INIT_POS.S008_LEFT_0 },
    { startId: DOOR.S009_LEFT_0, destId: INIT_POS.S010_RIGHT_0 },
    { startId: DOOR.S009_UP_0, destId: INIT_POS.S011_DOWN_0 },
  ],

  npcs: [],
};

export const s010Config: MapConfig = {
  key: 's010',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S008_S011,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S010_RIGHT_0, destId: INIT_POS.S009_LEFT_0 }],

  npcs: [],
};

export const s011Config: MapConfig = {
  key: 's011',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S008_S011,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S011_DOWN_0, destId: INIT_POS.S009_UP_0 }],

  npcs: [],
};

export const s012Config: MapConfig = {
  key: 's012',
  bgm: BGM.S012,
  isIndoor: false,
  area: { land: 'field', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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

  doors: [{ startId: DOOR.S012_DOWN_0, destId: INIT_POS.S008_UP_0 }],

  npcs: [],
};

export const s013Config: MapConfig = {
  key: 's013',
  bgm: BGM.S013_S014,
  isIndoor: false,
  area: { land: 'forest', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S013_LEFT_0, destId: INIT_POS.S003_RIGHT_0 },
    { startId: DOOR.S013_LEFT_1, destId: INIT_POS.S003_RIGHT_1 },
    { startId: DOOR.S013_RIGHT_0, destId: INIT_POS.S014_LEFT_0 },
    { startId: DOOR.S013_RIGHT_1, destId: INIT_POS.S014_LEFT_1 },
  ],

  npcs: [],
};

export const s014Config: MapConfig = {
  key: 's014',
  bgm: BGM.S013_S014,
  isIndoor: false,
  area: { land: 'forest', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S014_LEFT_0, destId: INIT_POS.S013_RIGHT_0 },
    { startId: DOOR.S014_LEFT_1, destId: INIT_POS.S013_RIGHT_1 },
    { startId: DOOR.S014_UP_0, destId: INIT_POS.S015_DOWN_0 },
    { startId: DOOR.S014_RIGHT_0, destId: INIT_POS.S032_LEFT_0 },
  ],

  npcs: [],
};

export const s015Config: MapConfig = {
  key: 's015',
  specialFilter: { kind: 'cave', variant: 'blue' },
  bgm: BGM.S015_S020,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S015_DOWN_0, destId: INIT_POS.S014_UP_0 },
    { startId: DOOR.S015_LEFT_0, destId: INIT_POS.S016_RIGHT_0 },
    // { startId: DOOR.S015_LEFT_0, destId: INIT_POS.S013_RIGHT_1 },
    // { startId: DOOR.S015_LEFT_1, destId: INIT_POS.S013_RIGHT_1 },
    // { startId: DOOR.S015_LEFT_2, destId: INIT_POS.S013_RIGHT_1 },
    // { startId: DOOR.S015_UP_0, destId: INIT_POS.S013_RIGHT_1 },
    // { startId: DOOR.S015_UP_1, destId: INIT_POS.S013_RIGHT_1 },
    // { startId: DOOR.S015_UP_2, destId: INIT_POS.S013_RIGHT_1 },
  ],

  npcs: [],
};

export const s016Config: MapConfig = {
  key: 's016',
  specialFilter: { kind: 'cave', variant: 'blue' },
  bgm: BGM.S015_S020,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S016_RIGHT_0, destId: INIT_POS.S015_LEFT_0 },
    { startId: DOOR.S016_LEFT_0, destId: INIT_POS.S017_RIGHT_0 },
    { startId: DOOR.S016_UP_0, destId: INIT_POS.S017_UP_0 },
    { startId: DOOR.S016_UP_1, destId: INIT_POS.S018_DOWN_0 },
    { startId: DOOR.S016_UP_2, destId: INIT_POS.S017_UP_1 },
  ],

  npcs: [],
};

export const s017Config: MapConfig = {
  key: 's017',
  bgm: BGM.S015_S020,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S017_RIGHT_0, destId: INIT_POS.S016_LEFT_0 },
    { startId: DOOR.S017_UP_0, destId: INIT_POS.S016_UP_0 },
    { startId: DOOR.S017_UP_1, destId: INIT_POS.S016_UP_2 },
  ],

  npcs: [],
};

export const s018Config: MapConfig = {
  key: 's018',
  specialFilter: { kind: 'cave', variant: 'blue' },
  bgm: BGM.S015_S020,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S018_DOWN_0, destId: INIT_POS.S016_UP_1 },
    { startId: DOOR.S018_UP_0, destId: INIT_POS.S019_DOWN_0 },
    { startId: DOOR.S018_LEFT_0, destId: INIT_POS.S019_RIGHT_0 },
  ],

  npcs: [],
};

export const s019Config: MapConfig = {
  key: 's019',
  bgm: BGM.S015_S020,
  isIndoor: false,
  area: { land: 'snow', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S019_RIGHT_0, destId: INIT_POS.S018_LEFT_0 },
    { startId: DOOR.S019_DOWN_0, destId: INIT_POS.S018_UP_0 },
    { startId: DOOR.S019_UP_0, destId: INIT_POS.S020_DOWN_0 },
  ],

  npcs: [],
};

export const s020Config: MapConfig = {
  key: 's020',
  specialFilter: { kind: 'cave', variant: 'ice' },
  bgm: BGM.S015_S020,
  isIndoor: false,
  area: { land: 'ice', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S020_RIGHT_0, destId: INIT_POS.S021_LEFT_0 },
    { startId: DOOR.S020_DOWN_0, destId: INIT_POS.S019_UP_0 },
  ],

  npcs: [],
};

export const s021Config: MapConfig = {
  key: 's021',
  bgm: BGM.S021,
  isIndoor: false,
  area: { land: 'snow', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S021_UP_0, destId: INIT_POS.S022_UP_0 },
    { startId: DOOR.S021_UP_1, destId: INIT_POS.S022_UP_1 },
    { startId: DOOR.S021_DOWN_0, destId: INIT_POS.S023_UP_0 },
    { startId: DOOR.S021_DOWN_1, destId: INIT_POS.S023_UP_1 },
    { startId: DOOR.S021_LEFT_0, destId: INIT_POS.S020_RIGHT_0 },
  ],

  npcs: [],
};

export const s022Config: MapConfig = {
  key: 's022',
  bgm: BGM.S022,
  isIndoor: false,
  area: { land: 'snow', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S022_UP_0, destId: INIT_POS.S021_UP_0 },
    { startId: DOOR.S022_UP_1, destId: INIT_POS.S021_UP_1 },
  ],

  npcs: [],
};

export const s023Config: MapConfig = {
  key: 's023',
  bgm: BGM.S023,
  isIndoor: false,
  area: { land: 'snow', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S023_UP_0, destId: INIT_POS.S021_DOWN_0 },
    { startId: DOOR.S023_UP_1, destId: INIT_POS.S021_DOWN_1 },
    { startId: DOOR.S023_RIGHT_0, destId: INIT_POS.S024_LEFT_0 },
  ],

  npcs: [],
};

export const s024Config: MapConfig = {
  key: 's024',
  specialFilter: { kind: 'cave', variant: 'ice' },
  bgm: BGM.S024_S031,
  isIndoor: false,
  area: { land: 'ice', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S024_UP_0, destId: INIT_POS.S025_DOWN_0 },
    { startId: DOOR.S024_LEFT_0, destId: INIT_POS.S023_RIGHT_0 },
    { startId: DOOR.S024_RIGHT_0, destId: INIT_POS.S028_UP_0 },
    { startId: DOOR.S024_RIGHT_1, destId: INIT_POS.S028_UP_0 },
  ],

  npcs: [],
};

export const s025Config: MapConfig = {
  key: 's025',
  specialFilter: { kind: 'cave', variant: 'ice' },
  bgm: BGM.S024_S031,
  isIndoor: false,
  area: { land: 'ice', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S025_DOWN_0, destId: INIT_POS.S024_UP_0 },
    { startId: DOOR.S025_LEFT_0, destId: INIT_POS.S026_RIGHT_0 },
    { startId: DOOR.S025_UP_0, destId: INIT_POS.S029_LEFT_0 },
    { startId: DOOR.S025_UP_1, destId: INIT_POS.S029_LEFT_0 },
    { startId: DOOR.S025_UP_2, destId: INIT_POS.S027_DOWN_0 },
  ],

  npcs: [],
};

export const s026Config: MapConfig = {
  key: 's026',
  specialFilter: { kind: 'cave', variant: 'ice' },
  bgm: BGM.S024_S031,
  isIndoor: false,
  area: { land: 'ice', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S026_RIGHT_0, destId: INIT_POS.S025_LEFT_0 }],

  npcs: [],
};

export const s027Config: MapConfig = {
  key: 's027',
  specialFilter: { kind: 'cave', variant: 'ice' },
  bgm: BGM.S024_S031,
  isIndoor: false,
  area: { land: 'ice', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S027_DOWN_0, destId: INIT_POS.S025_UP_1 }],

  npcs: [],
};

export const s028Config: MapConfig = {
  key: 's028',
  specialFilter: { kind: 'cave', variant: 'ice' },
  bgm: BGM.S024_S031,
  isIndoor: false,
  area: { land: 'ice', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S028_UP_0, destId: INIT_POS.S024_RIGHT_0 }],

  npcs: [],
};

export const s029Config: MapConfig = {
  key: 's029',
  specialFilter: { kind: 'cave', variant: 'ice' },
  bgm: BGM.S024_S031,
  isIndoor: false,
  area: { land: 'ice', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S029_LEFT_0, destId: INIT_POS.S025_UP_0 },
    { startId: DOOR.S029_UP_0, destId: INIT_POS.S030_UP_0 },
    { startId: DOOR.S029_UP_1, destId: INIT_POS.S030_UP_0 },
    { startId: DOOR.S029_DOWN_0, destId: INIT_POS.S031_UP_0 },
    { startId: DOOR.S029_DOWN_1, destId: INIT_POS.S031_UP_0 },
  ],

  npcs: [],
};

export const s030Config: MapConfig = {
  key: 's030',
  specialFilter: { kind: 'cave', variant: 'ice' },
  bgm: BGM.S024_S031,
  isIndoor: false,
  area: { land: 'ice', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S030_UP_0, destId: INIT_POS.S029_UP_0 }],

  npcs: [],
};

export const s031Config: MapConfig = {
  key: 's031',
  specialFilter: { kind: 'cave', variant: 'ice' },
  bgm: BGM.S024_S031,
  isIndoor: false,
  area: { land: 'ice', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S031_UP_0, destId: INIT_POS.S029_DOWN_0 }],

  npcs: [],
};

export const s032Config: MapConfig = {
  key: 's032',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S032_S038,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S032_LEFT_0, destId: INIT_POS.S014_RIGHT_0 },
    { startId: DOOR.S032_DOWN_0, destId: INIT_POS.S033_UP_0 },
    { startId: DOOR.S032_DOWN_1, destId: INIT_POS.S033_UP_0 },
    { startId: DOOR.S032_RIGHT_0, destId: INIT_POS.S039_LEFT_0 },
  ],

  npcs: [],
};

export const s033Config: MapConfig = {
  key: 's033',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S032_S038,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S033_UP_0, destId: INIT_POS.S032_DOWN_0 },
    { startId: DOOR.S033_DOWN_0, destId: INIT_POS.S034_LEFT_0 },
    { startId: DOOR.S033_DOWN_1, destId: INIT_POS.S034_UP_0 },
  ],

  npcs: [],
};

export const s034Config: MapConfig = {
  key: 's034',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S032_S038,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S034_LEFT_0, destId: INIT_POS.S033_DOWN_0 },
    { startId: DOOR.S034_UP_0, destId: INIT_POS.S033_DOWN_1 },
    { startId: DOOR.S034_RIGHT_0, destId: INIT_POS.S035_LEFT_0 },
  ],

  npcs: [],
};

export const s035Config: MapConfig = {
  key: 's035',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S032_S038,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S035_LEFT_0, destId: INIT_POS.S034_RIGHT_0 },
    { startId: DOOR.S035_UP_0, destId: INIT_POS.S036_UP_0 },
    { startId: DOOR.S035_UP_1, destId: INIT_POS.S036_UP_0 },
    { startId: DOOR.S035_DOWN_0, destId: INIT_POS.S037_UP_0 },
    { startId: DOOR.S035_DOWN_1, destId: INIT_POS.S037_UP_0 },
    { startId: DOOR.S035_RIGHT_0, destId: INIT_POS.S038_UP_0 },
  ],

  npcs: [],
};

export const s036Config: MapConfig = {
  key: 's036',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S032_S038,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S036_UP_0, destId: INIT_POS.S035_UP_0 }],

  npcs: [],
};

export const s037Config: MapConfig = {
  key: 's037',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S032_S038,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S037_UP_0, destId: INIT_POS.S035_DOWN_0 }],

  npcs: [],
};

export const s038Config: MapConfig = {
  key: 's038',
  specialFilter: { kind: 'cave', variant: 'dark' },
  bgm: BGM.S032_S038,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S038_UP_0, destId: INIT_POS.S035_RIGHT_0 }],

  npcs: [],
};

export const s039Config: MapConfig = {
  key: 's039',
  bgm: BGM.S039_S040,
  isIndoor: false,
  area: { land: 'sand', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S039_LEFT_0, destId: INIT_POS.S032_RIGHT_0 },
    { startId: DOOR.S039_RIGHT_0, destId: INIT_POS.S040_LEFT_0 },
    { startId: DOOR.S039_RIGHT_1, destId: INIT_POS.S040_LEFT_1 },
    { startId: DOOR.S039_RIGHT_1, destId: INIT_POS.S040_LEFT_1 },
  ],

  npcs: [],
};

export const s040Config: MapConfig = {
  key: 's040',
  bgm: BGM.S039_S040,
  isIndoor: false,
  area: { land: 'sand', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S040_LEFT_0, destId: INIT_POS.S039_RIGHT_0 },
    { startId: DOOR.S040_LEFT_1, destId: INIT_POS.S039_RIGHT_1 },
    { startId: DOOR.S040_LEFT_2, destId: INIT_POS.S039_RIGHT_2 },
    { startId: DOOR.S040_UP_0, destId: INIT_POS.S041_DOWN_0 },
    { startId: DOOR.S040_RIGHT_0, destId: INIT_POS.S042_LEFT_0 },
  ],

  npcs: [],
};

export const s041Config: MapConfig = {
  key: 's041',
  specialFilter: { kind: 'cave', variant: 'desertDark' },
  bgm: BGM.S041,
  isIndoor: false,
  area: { land: 'sand', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S041_DOWN_0, destId: INIT_POS.S040_UP_0 }],

  npcs: [],
};

export const s042Config: MapConfig = {
  key: 's042',
  specialFilter: { kind: 'cave', variant: 'blue' },
  bgm: BGM.S042_S045,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S042_LEFT_0, destId: INIT_POS.S040_RIGHT_0 },
    { startId: DOOR.S042_RIGHT_0, destId: INIT_POS.S043_UP_0 },
    { startId: DOOR.S042_RIGHT_1, destId: INIT_POS.S043_UP_0 },
  ],

  npcs: [],
};

export const s043Config: MapConfig = {
  key: 's043',
  specialFilter: { kind: 'cave', variant: 'red' },
  bgm: BGM.S042_S045,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.S043_UP_0, destId: INIT_POS.S042_RIGHT_0 },
    { startId: DOOR.S043_LEFT_0, destId: INIT_POS.S044_UP_0 },
    { startId: DOOR.S043_LEFT_1, destId: INIT_POS.S044_UP_0 },
    { startId: DOOR.S043_RIGHT_0, destId: INIT_POS.S045_LEFT_0 },
  ],

  npcs: [],
};

export const s044Config: MapConfig = {
  key: 's044',
  specialFilter: { kind: 'cave', variant: 'red' },
  bgm: BGM.S042_S045,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
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

  doors: [{ startId: DOOR.S044_UP_0, destId: INIT_POS.S043_LEFT_0 }],

  npcs: [],
};

export const s045Config: MapConfig = {
  key: 's045',
  specialFilter: { kind: 'cave', variant: 'red' },
  bgm: BGM.S042_S045,
  isIndoor: false,
  area: { land: 'rocky', water: 'water' },
  type: 'safari',
  dayNightFilter: false,
  weatherFilter: false,
  allowRide: true,
  tilesets: [
    TILE.OUTDOOR_FLOOR,
    TILE.OUTDOOR_EDGE,
    TILE.OUTDOOR_OBJECT,
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

  doors: [{ startId: DOOR.S045_LEFT_0, destId: INIT_POS.S043_RIGHT_0 }],

  npcs: [],
};

export const s046Config: MapConfig = {
  key: 's046',
  bgm: BGM.S046,
  isIndoor: false,
  area: { land: 'field', water: 'water' },
  type: 'safari',
  dayNightFilter: true,
  weatherFilter: true,
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
    { startId: DOOR.S046_UP_0, destId: INIT_POS.S001_DOWN_0 },
    { startId: DOOR.S046_UP_1, destId: INIT_POS.S001_DOWN_1 },
  ],

  npcs: [],
};
