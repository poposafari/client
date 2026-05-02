import { MapConfig } from '@poposafari/core/map.registry';
import { DEPTH, TEXTURE, TILE } from '@poposafari/types';
import { DIRECTION } from '../overworld.constants';
import { DOOR, INIT_POS } from './door';

export const p001Config: MapConfig = {
  key: 'p001',
  isIndoor: false,
  area: { land: 'p001', water: 'p001' },
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
    { startId: DOOR.P001_BOUTIQUE, destId: INIT_POS.P002_DOWN_0 },
    { startId: DOOR.P001_MART, destId: INIT_POS.P003_DOWN_0 },
    { startId: DOOR.P001_BIKE, destId: INIT_POS.P004_DOWN_0 },
    { startId: DOOR.P001_NPC1, destId: INIT_POS.P005_DOWN_0 },
    { startId: DOOR.P001_NPC2, destId: INIT_POS.P006_DOWN_0 },
    { startId: DOOR.P001_LAB, destId: INIT_POS.P008_DOWN_0 },
    { startId: DOOR.P001_NPC3, destId: INIT_POS.P009_DOWN_0 },
  ],

  npcs: [
    {
      key: 'npc2',
      name: '사파리존 테스트',
      special: 'safari',
      x: 43,
      y: 21,
      direction: DIRECTION.DOWN,
      reaction: [],
    },
    {
      key: '',
      name: '',
      x: 42,
      y: 21,
      direction: DIRECTION.DOWN,
      type: 'pokemon',
      pokedexId: '0823',
      isShiny: false,
      path: [],
      reaction: [{ key: 'talk', content: { text: 'msg:npc1_0', name: 'Pikachu' } }],
    },
    {
      key: 'npc2',
      name: '상점 주인',
      special: 'mart',
      martItems: [
        'safari-ball',
        'fire-stone',
        'water-stone',
        'thunder-stone',
        'dusk-stone',
        'deep-sea-tooth',
        'reaper-cloth',
        'razor-claw',
        'sachet',
        'metal-alloy',
        'nugget',
      ],
      x: 33,
      y: 17,
      direction: DIRECTION.DOWN,
      reaction: [],
    },
    {
      key: TEXTURE.BLANK,
      name: 'professor_office',
      x: 31,
      y: 28,
      direction: DIRECTION.RIGHT,
      reaction: [],
    },
    {
      key: TEXTURE.BLANK,
      name: 'department_store',
      x: 38,
      y: 28,
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
    // ── [TEST] 이동 NPC: 사람 ─────────────────────────────────────
    {
      key: 'npc1',
      name: 'walking_researcher',
      x: 27,
      y: 17,
      direction: DIRECTION.DOWN,
      type: 'human',
      path: [
        { direction: DIRECTION.RIGHT, tiles: 2, delayMs: 800 },
        { direction: DIRECTION.LEFT, tiles: 2, delayMs: 800 },
      ],
      reaction: [
        { key: 'talk', content: { text: 'msg:npc1_0', name: 'NPC' } },
        { key: 'talk', content: { text: 'msg:npc1_1', name: 'NPC' } },
      ],
    },
    // ── [TEST] 이동 NPC: 포켓몬 ───────────
    {
      key: 'pikachu_npc',
      name: 'wild_pikachu',
      x: 36,
      y: 20,
      direction: DIRECTION.DOWN,
      type: 'pokemon',
      pokedexId: '0025',
      isShiny: false,
      path: [
        { direction: DIRECTION.RIGHT, tiles: 1, delayMs: 600 },
        { direction: DIRECTION.DOWN, tiles: 1, delayMs: 600 },
        { direction: DIRECTION.LEFT, tiles: 1, delayMs: 600 },
        { direction: DIRECTION.UP, tiles: 1, delayMs: 600 },
      ],
      reaction: [{ key: 'talk', content: { text: 'msg:npc1_0', name: 'Pikachu' } }],
    },
  ],
};

export const p002Config: MapConfig = {
  key: 'p002',
  isIndoor: true,
  area: { land: 'p002', water: 'p002' },
  type: 'plaza',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.P002_DOWN_0, destId: INIT_POS.P001_BOUTIQUE },
    { startId: DOOR.P002_DOWN_1, destId: INIT_POS.P001_BOUTIQUE },
  ],
  npcs: [],
};

export const p003Config: MapConfig = {
  key: 'p003',
  isIndoor: true,
  area: { land: 'p003', water: 'p003' },
  type: 'plaza',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.P003_DOWN_0, destId: INIT_POS.P001_MART },
    { startId: DOOR.P003_DOWN_1, destId: INIT_POS.P001_MART },
  ],
  npcs: [],
};

export const p004Config: MapConfig = {
  key: 'p004',
  isIndoor: true,
  area: { land: 'p004', water: 'p004' },
  type: 'plaza',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.P004_DOWN_0, destId: INIT_POS.P001_BIKE },
    { startId: DOOR.P004_DOWN_1, destId: INIT_POS.P001_BIKE },
  ],
  npcs: [],
};

export const p005Config: MapConfig = {
  key: 'p005',
  isIndoor: true,
  area: { land: 'p005', water: 'p005' },
  type: 'plaza',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.P005_DOWN_0, destId: INIT_POS.P001_NPC1 },
    { startId: DOOR.P005_DOWN_1, destId: INIT_POS.P001_NPC1 },
  ],
  npcs: [],
};

export const p006Config: MapConfig = {
  key: 'p006',
  isIndoor: true,
  area: { land: 'p006', water: 'p006' },
  type: 'plaza',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.P006_DOWN_0, destId: INIT_POS.P001_NPC2 },
    { startId: DOOR.P006_DOWN_1, destId: INIT_POS.P001_NPC2 },
    { startId: DOOR.P006_RIGHT_0, destId: INIT_POS.P007_LEFT_0 },
  ],
  npcs: [],
};

export const p007Config: MapConfig = {
  key: 'p007',
  isIndoor: true,
  area: { land: 'p007', water: 'p007' },
  type: 'plaza',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.P007_LEFT_0, destId: INIT_POS.P006_RIGHT_0 },
    { startId: DOOR.P007_LEFT_1, destId: INIT_POS.P006_RIGHT_0 },
  ],
  npcs: [],
};

export const p008Config: MapConfig = {
  key: 'p008',
  isIndoor: true,
  area: { land: 'p008', water: 'p008' },
  type: 'plaza',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.P008_DOWN_0, destId: INIT_POS.P001_LAB },
    { startId: DOOR.P008_DOWN_1, destId: INIT_POS.P001_LAB },
  ],
  npcs: [],
};

export const p009Config: MapConfig = {
  key: 'p009',
  isIndoor: true,
  area: { land: 'p009', water: 'p009' },
  type: 'plaza',
  dayNightFilter: false,
  weatherFilter: false,
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
    { startId: DOOR.P009_DOWN_0, destId: INIT_POS.P001_NPC3 },
    { startId: DOOR.P009_DOWN_1, destId: INIT_POS.P001_NPC3 },
  ],
  npcs: [],
};
