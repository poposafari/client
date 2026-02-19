import { MapConfig } from '@poposafari/core/map.registry';
import { DEPTH, TEXTURE, TILE } from '@poposafari/types';
import { DIRECTION } from '../overworld.constants';
import { DOOR, INIT_POS } from './door';

export const p001Config: MapConfig = {
  key: 'p001',
  isIndoor: false,
  area: 'p001',
  type: 'plaza',
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
      texture: [
        TILE.OUTDOOR_OBJECT_URBAN,
        TILE.OUTDOOR_OBJECT,
        TILE.OUTDOOR_URBAN,
        TILE.OUTDOOR_EDGE,
      ],
      depth: DEPTH.FOREGROUND,
    },
    {
      idx: 12,
      texture: [
        TILE.OUTDOOR_OBJECT_URBAN,
        TILE.OUTDOOR_OBJECT,
        TILE.OUTDOOR_URBAN,
        TILE.OUTDOOR_EDGE,
      ],
      depth: DEPTH.FOREGROUND,
    },
  ],

  doors: [
    { startId: DOOR.P001_PROF_0, destId: INIT_POS.P002_DOWN_0 },
    { startId: DOOR.P001_POKEMART_0, destId: INIT_POS.P004_DOWN_0 },
    { startId: DOOR.P001_BIKE_SHOP_0, destId: INIT_POS.P005_DOWN_0 },
    { startId: DOOR.P001_CENTER_0, destId: INIT_POS.P006_DOWN_0 },
    { startId: DOOR.P001_CENTER_1, destId: INIT_POS.P006_DOWN_0 },
    { startId: DOOR.P001_NPC0_0, destId: INIT_POS.P007_DOWN_0 },
    { startId: DOOR.P001_AVATAR_0, destId: INIT_POS.P009_DOWN_0 },
    { startId: DOOR.P001_NPC1_0, destId: INIT_POS.P010_DOWN_0 },
    { startId: DOOR.P001_CAFE_0, destId: INIT_POS.P011_DOWN_0 },
    { startId: DOOR.P001_MUSEUM_0, destId: INIT_POS.P013_DOWN_0 },
    { startId: DOOR.P001_DEPARTMENT_STORE_0, destId: INIT_POS.P015_DOWN_0 },
    { startId: DOOR.P001_NPC2_0, destId: INIT_POS.P019_DOWN_0 },
    { startId: DOOR.P001_NPC3_0, destId: INIT_POS.P020_DOWN_0 },
    { startId: DOOR.P001_NPC4_0, destId: INIT_POS.P022_DOWN_0 },
  ],

  npcs: [
    {
      key: TEXTURE.BLANK,
      name: 'professor_office',
      x: 18,
      y: 17,
      direction: DIRECTION.RIGHT,
      reaction: [],
    },
    {
      key: TEXTURE.BLANK,
      name: 'department_store',
      x: 23,
      y: 42,
      direction: DIRECTION.RIGHT,
      reaction: [
        {
          key: 'notice',
          content: { text: 'msg:department_store_0', name: 'NPC', window: TEXTURE.WINDOW_NOTICE_0 },
        },
        {
          key: 'notice',
          content: { text: 'msg:department_store_1', name: 'NPC', window: TEXTURE.WINDOW_NOTICE_0 },
        },
      ],
    },
    {
      key: TEXTURE.BLANK,
      name: 'museum',
      x: 35,
      y: 42,
      direction: DIRECTION.RIGHT,
      reaction: [
        {
          key: 'notice',
          content: { text: 'msg:museum_0', name: 'NPC', window: TEXTURE.WINDOW_NOTICE_0 },
        },
      ],
    },
    {
      key: TEXTURE.BLANK,
      name: 'cafe',
      x: 40,
      y: 42,
      direction: DIRECTION.RIGHT,
      reaction: [
        {
          key: 'notice',
          content: { text: 'msg:cafe_0', name: 'NPC', window: TEXTURE.WINDOW_NOTICE_0 },
        },
      ],
    },
    {
      key: TEXTURE.BLANK,
      name: 'center',
      x: 40,
      y: 26,
      direction: DIRECTION.RIGHT,
      reaction: [
        {
          key: 'notice',
          content: { text: 'msg:center_0', name: 'NPC', window: TEXTURE.WINDOW_NOTICE_0 },
        },
      ],
    },
  ],
};

export const p002Config: MapConfig = {
  key: 'p002',
  isIndoor: true,
  area: 'p002',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P002_RIGHT_0, destId: INIT_POS.P003_RIGHT_0 },
    { startId: DOOR.P002_DOWN_0, destId: INIT_POS.P001_PROF_0 },
    { startId: DOOR.P002_DOWN_1, destId: INIT_POS.P001_PROF_0 },
    { startId: DOOR.P002_DOWN_2, destId: INIT_POS.P001_PROF_0 },
  ],
  npcs: [
    {
      key: 'npc0',
      name: 'professor',
      special: 'professor',
      x: 18,
      y: 6,
      direction: DIRECTION.DOWN,
      reaction: [],
    },
    {
      key: 'npc1',
      name: 'researcher_0',
      x: 12,
      y: 17,
      direction: DIRECTION.UP,
      reaction: [
        { key: 'talk', content: { text: 'msg:npc1_0', name: 'NPC' } },
        { key: 'talk', content: { text: 'msg:npc1_1', name: 'NPC' } },
      ],
    },
  ],
};

export const p003Config: MapConfig = {
  key: 'p003',
  isIndoor: true,
  area: 'p003',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  // battleArea: 'p003',
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P003_RIGHT_0, destId: INIT_POS.P002_RIGHT_0 },
    { startId: DOOR.P003_RIGHT_1, destId: INIT_POS.P002_RIGHT_0 },
  ],
};

export const p004Config: MapConfig = {
  key: 'p004',
  isIndoor: true,
  area: 'p004',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P004_DOWN_0, destId: INIT_POS.P001_POKEMART_0 },
    { startId: DOOR.P004_DOWN_1, destId: INIT_POS.P001_POKEMART_0 },
    { startId: DOOR.P004_DOWN_2, destId: INIT_POS.P001_POKEMART_0 },
  ],
};

export const p005Config: MapConfig = {
  key: 'p005',
  isIndoor: true,
  area: 'p005',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P005_DOWN_0, destId: INIT_POS.P001_BIKE_SHOP_0 },
    { startId: DOOR.P005_DOWN_1, destId: INIT_POS.P001_BIKE_SHOP_0 },
  ],
};

export const p006Config: MapConfig = {
  key: 'p006',
  isIndoor: true,
  area: 'p006',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P006_DOWN_0, destId: INIT_POS.P001_CENTER_0 },
    { startId: DOOR.P006_DOWN_1, destId: INIT_POS.P001_CENTER_0 },
    { startId: DOOR.P006_DOWN_2, destId: INIT_POS.P001_CENTER_0 },
  ],
};

export const p007Config: MapConfig = {
  key: 'p007',
  isIndoor: true,
  area: 'p007',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P007_DOWN_0, destId: INIT_POS.P001_NPC0_0 },
    { startId: DOOR.P007_DOWN_1, destId: INIT_POS.P001_NPC0_0 },
    { startId: DOOR.P007_DOWN_2, destId: INIT_POS.P001_NPC0_0 },
    { startId: DOOR.P007_RIGHT_0, destId: INIT_POS.P008_RIGHT_0 },
  ],
};

export const p008Config: MapConfig = {
  key: 'p008',
  isIndoor: true,
  area: 'p008',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P008_RIGHT_0, destId: INIT_POS.P007_RIGHT_0 },
    { startId: DOOR.P008_RIGHT_1, destId: INIT_POS.P007_RIGHT_0 },
  ],
};

export const p009Config: MapConfig = {
  key: 'p009',
  isIndoor: true,
  area: 'p009',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P009_DOWN_0, destId: INIT_POS.P001_AVATAR_0 },
    { startId: DOOR.P009_DOWN_1, destId: INIT_POS.P001_AVATAR_0 },
    { startId: DOOR.P009_DOWN_2, destId: INIT_POS.P001_AVATAR_0 },
  ],
};

export const p010Config: MapConfig = {
  key: 'p010',
  isIndoor: true,
  area: 'p010',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P010_DOWN_0, destId: INIT_POS.P001_NPC1_0 },
    { startId: DOOR.P010_DOWN_1, destId: INIT_POS.P001_NPC1_0 },
  ],
};

export const p011Config: MapConfig = {
  key: 'p011',
  isIndoor: true,
  area: 'p011',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P011_DOWN_0, destId: INIT_POS.P001_CAFE_0 },
    { startId: DOOR.P011_DOWN_1, destId: INIT_POS.P001_CAFE_0 },
    { startId: DOOR.P011_DOWN_2, destId: INIT_POS.P001_CAFE_0 },
    { startId: DOOR.P011_LEFT_0, destId: INIT_POS.P012_LEFT_0 },
    { startId: DOOR.P011_RIGHT_0, destId: INIT_POS.P012_RIGHT_0 },
  ],
};

export const p012Config: MapConfig = {
  key: 'p012',
  isIndoor: true,
  area: 'p012',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [{ idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND }],

  doors: [
    { startId: DOOR.P012_LEFT_0, destId: INIT_POS.P011_LEFT_0 },
    { startId: DOOR.P012_LEFT_1, destId: INIT_POS.P011_LEFT_0 },
    { startId: DOOR.P012_RIGHT_0, destId: INIT_POS.P011_RIGHT_0 },
    { startId: DOOR.P012_RIGHT_1, destId: INIT_POS.P011_RIGHT_0 },
  ],
};

export const p013Config: MapConfig = {
  key: 'p013',
  isIndoor: true,
  area: 'p013',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [
    { startId: DOOR.P013_DOWN_0, destId: INIT_POS.P001_MUSEUM_0 },
    { startId: DOOR.P013_DOWN_1, destId: INIT_POS.P001_MUSEUM_0 },
    { startId: DOOR.P013_LEFT_0, destId: INIT_POS.P014_LEFT_0 },
    { startId: DOOR.P013_RIGHT_0, destId: INIT_POS.P014_RIGHT_0 },
  ],
};

export const p014Config: MapConfig = {
  key: 'p014',
  isIndoor: true,
  area: 'p014',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [
    { startId: DOOR.P014_LEFT_0, destId: INIT_POS.P013_LEFT_0 },
    { startId: DOOR.P014_LEFT_1, destId: INIT_POS.P013_LEFT_0 },
    { startId: DOOR.P014_RIGHT_0, destId: INIT_POS.P013_RIGHT_0 },
    { startId: DOOR.P014_RIGHT_1, destId: INIT_POS.P013_RIGHT_0 },
  ],
};

export const p015Config: MapConfig = {
  key: 'p015',
  isIndoor: true,
  area: 'p015',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [
    { startId: DOOR.P015_DOWN_0, destId: INIT_POS.P001_DEPARTMENT_STORE_0 },
    { startId: DOOR.P015_DOWN_1, destId: INIT_POS.P001_DEPARTMENT_STORE_0 },
    { startId: DOOR.P015_DOWN_2, destId: INIT_POS.P001_DEPARTMENT_STORE_0 },
    { startId: DOOR.P015_RIGHT_0, destId: INIT_POS.P016_LEFT_0 },
    { startId: DOOR.P015_RIGHT_1, destId: INIT_POS.P016_LEFT_0 },
  ],
};

export const p016Config: MapConfig = {
  key: 'p016',
  isIndoor: true,
  area: 'p016',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [
    { startId: DOOR.P016_LEFT_0, destId: INIT_POS.P015_RIGHT_0 },
    { startId: DOOR.P016_RIGHT_0, destId: INIT_POS.P017_LEFT_0 },
    { startId: DOOR.P016_RIGHT_1, destId: INIT_POS.P017_LEFT_0 },
  ],
};

export const p017Config: MapConfig = {
  key: 'p017',
  isIndoor: true,
  area: 'p017',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [{ startId: DOOR.P017_LEFT_0, destId: INIT_POS.P016_RIGHT_0 }],
};

export const p019Config: MapConfig = {
  key: 'p019',
  isIndoor: true,
  area: 'p019',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [
    { startId: DOOR.P019_DOWN_0, destId: INIT_POS.P001_NPC2_0 },
    { startId: DOOR.P019_DOWN_1, destId: INIT_POS.P001_NPC2_0 },
  ],
};

export const p020Config: MapConfig = {
  key: 'p020',
  isIndoor: true,
  area: 'p020',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [
    { startId: DOOR.P020_DOWN_0, destId: INIT_POS.P001_NPC3_0 },
    { startId: DOOR.P020_DOWN_1, destId: INIT_POS.P001_NPC3_0 },
    { startId: DOOR.P020_RIGHT_0, destId: INIT_POS.P021_RIGHT_0 },
  ],
};

export const p021Config: MapConfig = {
  key: 'p021',
  isIndoor: true,
  area: 'p021',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [
    { startId: DOOR.P021_RIGHT_0, destId: INIT_POS.P020_RIGHT_0 },
    { startId: DOOR.P021_RIGHT_1, destId: INIT_POS.P020_RIGHT_0 },
  ],
};

export const p022Config: MapConfig = {
  key: 'p022',
  isIndoor: true,
  area: 'p022',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [
    { startId: DOOR.P022_DOWN_0, destId: INIT_POS.P001_NPC4_0 },
    { startId: DOOR.P022_DOWN_1, destId: INIT_POS.P001_NPC4_0 },
    { startId: DOOR.P022_DOWN_2, destId: INIT_POS.P001_NPC4_0 },
    { startId: DOOR.P022_LEFT_0, destId: INIT_POS.P023_RIGHT_0 },
  ],
};

export const p023Config: MapConfig = {
  key: 'p023',
  isIndoor: true,
  area: 'p023',
  type: 'plaza',
  dayNightFilter: false,
  allowRide: false,
  tilesets: [TILE.INDOOR_FLOOR, TILE.INDOOR_OBJECT, TILE.INDOOR_EVENT],
  layers: [
    { idx: 0, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND },
    { idx: 1, texture: TILE.INDOOR_FLOOR, depth: DEPTH.GROUND + 1 },
    { idx: 2, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 2 },
    { idx: 3, texture: TILE.INDOOR_OBJECT, depth: DEPTH.GROUND + 3 },
    { idx: 4, texture: TILE.INDOOR_EVENT, depth: DEPTH.GROUND + 4 },
  ],
  foreground: [
    { idx: 5, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
    { idx: 6, texture: [TILE.INDOOR_OBJECT], depth: DEPTH.FOREGROUND },
  ],

  doors: [
    { startId: DOOR.P023_RIGHT_0, destId: INIT_POS.P022_LEFT_0 },
    { startId: DOOR.P023_RIGHT_1, destId: INIT_POS.P022_LEFT_0 },
  ],
};
