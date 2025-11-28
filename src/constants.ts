import { OVERWORLD_DOOR, OVERWORLD_INIT_POS, TEXTURE } from './enums';
import { OverworldDoorData, OverworldInitPosData } from './types';

export const VERSION = 'v0.1.0';

export const TILE_SIZE = 32;
export const MAP_SCALE = 1.5;
export const PLAYER_SCALE = 3;
export const MAX_ITEM_SLOT = 9;
export const MAX_QUICK_ITEM_SLOT = 5;
export const MAX_PARTY_SLOT = 6;
export const MAX_PC_SLOT = 33;
export const MAX_PC_BG = 15;
export const MAX_POKEDEX = 9;

export const OVERWORLD_DOOR_DATA: Record<OVERWORLD_DOOR, OverworldDoorData> = {
  //PLAZA_001
  [OVERWORLD_DOOR.P001_WEST_GATE_0]: { door: TEXTURE.BLANK, x: 4, y: 25, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_WEST_GATE_1]: { door: TEXTURE.BLANK, x: 4, y: 26, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_SOUTH_GATE_0]: { door: TEXTURE.BLANK, x: 24, y: 56, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_SOUTH_GATE_1]: { door: TEXTURE.BLANK, x: 25, y: 56, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_NORTH_GATE_0]: { door: TEXTURE.BLANK, x: 34, y: 4, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_NORTH_GATE_1]: { door: TEXTURE.BLANK, x: 35, y: 4, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_EAST_GATE_0]: { door: TEXTURE.BLANK, x: 51, y: 32, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_EAST_GATE_1]: { door: TEXTURE.BLANK, x: 51, y: 33, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_LAB_0]: { door: 'door_9', x: 12, y: 14, offsetY: +7, width: 130, height: 100 },
  [OVERWORLD_DOOR.P001_POKE_MART_0]: { door: 'door_1', x: 16, y: 23, offsetY: +5, width: 140, height: 102 },
  [OVERWORLD_DOOR.P001_RIDE_MART_0]: { door: 'door_1', x: 22, y: 23, offsetY: +7, width: 125, height: 92 },
  [OVERWORLD_DOOR.P001_CITY_HALL_0]: { door: TEXTURE.BLANK, x: 28, y: 22, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_CITY_HALL_1]: { door: TEXTURE.BLANK, x: 29, y: 22, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_NPC1_0]: { door: 'door_9', x: 40, y: 23, offsetY: +7, width: 130, height: 106 },
  [OVERWORLD_DOOR.P001_BOUTIQUE_0]: { door: 'door_8', x: 40, y: 30, offsetY: +7, width: 105, height: 106 },
  [OVERWORLD_DOOR.P001_NPC2_0]: { door: 'door_14', x: 46, y: 30, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_CAFE_0]: { door: TEXTURE.BLANK, x: 29, y: 39, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_MUSEUM_0]: { door: TEXTURE.BLANK, x: 23, y: 38, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P001_BIG_MART_0]: { door: 'door_1', x: 17, y: 38, offsetY: +7, width: 116, height: 100 },
  [OVERWORLD_DOOR.P001_NPC3_0]: { door: 'door_15', x: 17, y: 48, offsetY: +7, width: 136, height: 102 },
  [OVERWORLD_DOOR.P001_NPC4_0]: { door: 'door_10', x: 29, y: 48, offsetY: +7, width: 130, height: 110 },
  [OVERWORLD_DOOR.P001_CLUB_ROOM_0]: { door: 'door_8', x: 35, y: 48, offsetY: +7, width: 105, height: 106 },

  //PLAZA_002
  [OVERWORLD_DOOR.P002_EXIT_0]: { door: TEXTURE.BLANK, x: 15, y: 22, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P002_EXIT_1]: { door: TEXTURE.BLANK, x: 16, y: 22, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P002_EXIT_2]: { door: TEXTURE.BLANK, x: 17, y: 22, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P002_STAIR_0]: { door: TEXTURE.BLANK, x: 33, y: 4, offsetY: +7, width: 130, height: 102 },

  //PLAZA_003
  [OVERWORLD_DOOR.P003_STAIR_0]: { door: TEXTURE.BLANK, x: 26, y: 4, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P003_STAIR_1]: { door: TEXTURE.BLANK, x: 26, y: 5, offsetY: +7, width: 130, height: 102 },

  //PLAZA_004
  [OVERWORLD_DOOR.P004_EXIT_0]: { door: TEXTURE.BLANK, x: 6, y: 12, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P004_EXIT_1]: { door: TEXTURE.BLANK, x: 7, y: 12, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P004_EXIT_2]: { door: TEXTURE.BLANK, x: 8, y: 12, offsetY: +7, width: 130, height: 102 },

  //PLAZA_005
  [OVERWORLD_DOOR.P005_EXIT_0]: { door: TEXTURE.BLANK, x: 7, y: 14, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P005_EXIT_1]: { door: TEXTURE.BLANK, x: 8, y: 14, offsetY: +7, width: 130, height: 102 },

  //PLAZA_006
  [OVERWORLD_DOOR.P006_EXIT_0]: { door: TEXTURE.BLANK, x: 8, y: 21, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P006_EXIT_1]: { door: TEXTURE.BLANK, x: 9, y: 21, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P006_EXIT_2]: { door: TEXTURE.BLANK, x: 10, y: 21, offsetY: +7, width: 130, height: 102 },

  //PLAZA_007
  [OVERWORLD_DOOR.P007_EXIT_0]: { door: TEXTURE.BLANK, x: 8, y: 16, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P007_EXIT_1]: { door: TEXTURE.BLANK, x: 9, y: 16, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P007_EXIT_2]: { door: TEXTURE.BLANK, x: 10, y: 16, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P007_STAIR_0]: { door: TEXTURE.BLANK, x: 13, y: 4, offsetY: +7, width: 130, height: 102 },

  //PLAZA_008
  [OVERWORLD_DOOR.P008_STAIR_0]: { door: TEXTURE.BLANK, x: 12, y: 4, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P008_STAIR_1]: { door: TEXTURE.BLANK, x: 12, y: 5, offsetY: +7, width: 130, height: 102 },

  //PLAZA_009
  [OVERWORLD_DOOR.P009_EXIT_0]: { door: TEXTURE.BLANK, x: 7, y: 13, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P009_EXIT_1]: { door: TEXTURE.BLANK, x: 8, y: 13, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P009_EXIT_2]: { door: TEXTURE.BLANK, x: 9, y: 13, offsetY: +7, width: 130, height: 102 },

  //PLAZA_010
  [OVERWORLD_DOOR.P010_EXIT_0]: { door: TEXTURE.BLANK, x: 7, y: 13, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P010_EXIT_1]: { door: TEXTURE.BLANK, x: 8, y: 13, offsetY: +7, width: 130, height: 102 },

  //PLAZA_011
  [OVERWORLD_DOOR.P011_EXIT_0]: { door: TEXTURE.BLANK, x: 7, y: 20, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P011_EXIT_1]: { door: TEXTURE.BLANK, x: 8, y: 20, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P011_EXIT_2]: { door: TEXTURE.BLANK, x: 9, y: 20, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P011_STAIR_0]: { door: TEXTURE.BLANK, x: 2, y: 4, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P011_STAIR_1]: { door: TEXTURE.BLANK, x: 14, y: 4, offsetY: +7, width: 130, height: 102 },

  //PLAZA_012
  [OVERWORLD_DOOR.P012_STAIR_0]: { door: TEXTURE.BLANK, x: 5, y: 4, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P012_STAIR_1]: { door: TEXTURE.BLANK, x: 5, y: 5, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P012_STAIR_2]: { door: TEXTURE.BLANK, x: 11, y: 4, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P012_STAIR_3]: { door: TEXTURE.BLANK, x: 11, y: 5, offsetY: +7, width: 130, height: 102 },

  //PLAZA_019
  [OVERWORLD_DOOR.P019_EXIT_0]: { door: TEXTURE.BLANK, x: 1, y: 20, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P019_EXIT_1]: { door: TEXTURE.BLANK, x: 2, y: 20, offsetY: +7, width: 130, height: 102 },

  //PLAZA_020
  [OVERWORLD_DOOR.P020_EXIT_0]: { door: TEXTURE.BLANK, x: 8, y: 19, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P020_EXIT_1]: { door: TEXTURE.BLANK, x: 9, y: 19, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P020_STAIR_0]: { door: TEXTURE.BLANK, x: 10, y: 4, offsetY: +7, width: 130, height: 102 },

  //PLAZA_021
  [OVERWORLD_DOOR.P021_STAIR_0]: { door: TEXTURE.BLANK, x: 12, y: 3, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P021_STAIR_1]: { door: TEXTURE.BLANK, x: 12, y: 4, offsetY: +7, width: 130, height: 102 },

  //PLAZA_022
  [OVERWORLD_DOOR.P022_EXIT_0]: { door: TEXTURE.BLANK, x: 8, y: 18, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P022_EXIT_1]: { door: TEXTURE.BLANK, x: 9, y: 18, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P022_EXIT_2]: { door: TEXTURE.BLANK, x: 10, y: 18, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P022_STAIR_0]: { door: TEXTURE.BLANK, x: 2, y: 4, offsetY: +7, width: 130, height: 102 },

  //PLAZA_023
  [OVERWORLD_DOOR.P023_STAIR_0]: { door: TEXTURE.BLANK, x: 16, y: 4, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.P023_STAIR_1]: { door: TEXTURE.BLANK, x: 16, y: 5, offsetY: +7, width: 130, height: 102 },

  //GATE_001
  [OVERWORLD_DOOR.G001_LEFT_0]: { door: TEXTURE.BLANK, x: 0, y: 5, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G001_LEFT_1]: { door: TEXTURE.BLANK, x: 0, y: 6, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G001_LEFT_2]: { door: TEXTURE.BLANK, x: 0, y: 7, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G001_RIGHT_0]: { door: TEXTURE.BLANK, x: 12, y: 5, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G001_RIGHT_1]: { door: TEXTURE.BLANK, x: 12, y: 6, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G001_RIGHT_2]: { door: TEXTURE.BLANK, x: 12, y: 7, offsetY: +7, width: 130, height: 102 },

  //GATE_002
  [OVERWORLD_DOOR.G002_UP_0]: { door: TEXTURE.BLANK, x: 4, y: 1, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G002_UP_1]: { door: TEXTURE.BLANK, x: 5, y: 1, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G002_UP_2]: { door: TEXTURE.BLANK, x: 6, y: 1, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G002_DOWN_0]: { door: TEXTURE.BLANK, x: 4, y: 13, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G002_DOWN_1]: { door: TEXTURE.BLANK, x: 5, y: 13, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G002_DOWN_2]: { door: TEXTURE.BLANK, x: 6, y: 13, offsetY: +7, width: 130, height: 102 },

  //GATE_003
  [OVERWORLD_DOOR.G003_LEFT_0]: { door: TEXTURE.BLANK, x: 0, y: 5, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G003_LEFT_1]: { door: TEXTURE.BLANK, x: 0, y: 6, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G003_LEFT_2]: { door: TEXTURE.BLANK, x: 0, y: 7, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G003_RIGHT_0]: { door: TEXTURE.BLANK, x: 12, y: 5, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G003_RIGHT_1]: { door: TEXTURE.BLANK, x: 12, y: 6, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G003_RIGHT_2]: { door: TEXTURE.BLANK, x: 12, y: 7, offsetY: +7, width: 130, height: 102 },

  //GATE_004
  [OVERWORLD_DOOR.G004_UP_0]: { door: TEXTURE.BLANK, x: 4, y: 1, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G004_UP_1]: { door: TEXTURE.BLANK, x: 5, y: 1, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G004_UP_2]: { door: TEXTURE.BLANK, x: 6, y: 1, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G004_DOWN_0]: { door: TEXTURE.BLANK, x: 4, y: 13, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G004_DOWN_1]: { door: TEXTURE.BLANK, x: 5, y: 13, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.G004_DOWN_2]: { door: TEXTURE.BLANK, x: 6, y: 13, offsetY: +7, width: 130, height: 102 },

  //SAFARI_001
  [OVERWORLD_DOOR.S001_RIGHT_ROAD_0]: { door: TEXTURE.BLANK, x: 66, y: 15, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S001_RIGHT_ROAD_1]: { door: TEXTURE.BLANK, x: 66, y: 16, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S001_UP_ROAD_0]: { door: TEXTURE.BLANK, x: 14, y: 8, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S001_UP_ROAD_1]: { door: TEXTURE.BLANK, x: 15, y: 8, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S001_LEFT_ROAD_0]: { door: TEXTURE.BLANK, x: 0, y: 14, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S001_LEFT_ROAD_1]: { door: TEXTURE.BLANK, x: 0, y: 15, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S001_LEFT_ROAD_2]: { door: TEXTURE.BLANK, x: 0, y: 16, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S001_LEFT_ROAD_3]: { door: TEXTURE.BLANK, x: 0, y: 17, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S001_LEFT_ROAD_4]: { door: TEXTURE.BLANK, x: 0, y: 18, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S001_LEFT_ROAD_5]: { door: TEXTURE.BLANK, x: 0, y: 19, offsetY: +7, width: 130, height: 102 },

  //SAFARI_002
  [OVERWORLD_DOOR.S002_DOWN_ROAD_0]: { door: TEXTURE.BLANK, x: 12, y: 57, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S002_DOWN_ROAD_1]: { door: TEXTURE.BLANK, x: 13, y: 57, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S002_LEFT_ROAD_0]: { door: TEXTURE.BLANK, x: 3, y: 26, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S002_LEFT_ROAD_1]: { door: TEXTURE.BLANK, x: 3, y: 27, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S002_CAVE_0]: { door: TEXTURE.BLANK, x: 24, y: 22, offsetY: +7, width: 130, height: 102 },

  //SAFARI_003
  [OVERWORLD_DOOR.S003_DOWN_ROAD_0]: { door: TEXTURE.BLANK, x: 12, y: 49, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S003_UP_ROAD_0]: { door: TEXTURE.BLANK, x: 27, y: 11, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S003_RIGHT_ROAD_0]: { door: TEXTURE.BLANK, x: 50, y: 22, offsetY: +7, width: 130, height: 102 },

  //SAFARI_004
  [OVERWORLD_DOOR.S004_LEFT_ROAD_0]: { door: TEXTURE.BLANK, x: 5, y: 21, offsetY: +7, width: 130, height: 102 },

  //SAFARI_005
  [OVERWORLD_DOOR.S005_DOWN_ROAD_0]: { door: TEXTURE.BLANK, x: 21, y: 35, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S005_UP_ROAD_0]: { door: TEXTURE.BLANK, x: 14, y: 4, offsetY: +7, width: 130, height: 102 },

  //SAFARI_006
  [OVERWORLD_DOOR.S006_DOWN_ROAD_0]: { door: TEXTURE.BLANK, x: 25, y: 43, offsetY: +7, width: 130, height: 102 },

  //SAFARI_007
  [OVERWORLD_DOOR.S007_RIGHT_ROAD_0]: { door: TEXTURE.BLANK, x: 76, y: 28, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S007_RIGHT_ROAD_1]: { door: TEXTURE.BLANK, x: 76, y: 29, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S007_UP_ROAD_0]: { door: TEXTURE.BLANK, x: 25, y: 0, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S007_UP_ROAD_1]: { door: TEXTURE.BLANK, x: 26, y: 0, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S007_UP_ROAD_2]: { door: TEXTURE.BLANK, x: 27, y: 0, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S007_UP_ROAD_3]: { door: TEXTURE.BLANK, x: 28, y: 0, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S007_UP_ROAD_4]: { door: TEXTURE.BLANK, x: 29, y: 0, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S007_UP_ROAD_5]: { door: TEXTURE.BLANK, x: 30, y: 0, offsetY: +7, width: 130, height: 102 },

  //SAFARI_008
  [OVERWORLD_DOOR.S008_DOWN_ROAD_0]: { door: TEXTURE.BLANK, x: 20, y: 43, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_DOWN_ROAD_1]: { door: TEXTURE.BLANK, x: 21, y: 43, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_DOWN_ROAD_2]: { door: TEXTURE.BLANK, x: 22, y: 43, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_DOWN_ROAD_3]: { door: TEXTURE.BLANK, x: 23, y: 43, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_DOWN_ROAD_4]: { door: TEXTURE.BLANK, x: 24, y: 43, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_DOWN_ROAD_5]: { door: TEXTURE.BLANK, x: 25, y: 43, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_LEFT_ROAD_0]: { door: TEXTURE.BLANK, x: 0, y: 7, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_LEFT_ROAD_1]: { door: TEXTURE.BLANK, x: 0, y: 8, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_LEFT_ROAD_2]: { door: TEXTURE.BLANK, x: 0, y: 9, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_LEFT_ROAD_3]: { door: TEXTURE.BLANK, x: 0, y: 10, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S008_LEFT_ROAD_4]: { door: TEXTURE.BLANK, x: 0, y: 11, offsetY: +7, width: 130, height: 102 },

  //SAFARI_009
  [OVERWORLD_DOOR.S009_RIGHT_ROAD_0]: { door: TEXTURE.BLANK, x: 49, y: 12, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S009_RIGHT_ROAD_1]: { door: TEXTURE.BLANK, x: 49, y: 13, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S009_RIGHT_ROAD_2]: { door: TEXTURE.BLANK, x: 49, y: 14, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S009_RIGHT_ROAD_3]: { door: TEXTURE.BLANK, x: 49, y: 15, offsetY: +7, width: 130, height: 102 },

  //SAFARI_010
  [OVERWORLD_DOOR.S010_RIGHT_ROAD_0]: { door: TEXTURE.BLANK, x: 31, y: 14, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S010_RIGHT_ROAD_1]: { door: TEXTURE.BLANK, x: 31, y: 15, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S010_RIGHT_ROAD_2]: { door: TEXTURE.BLANK, x: 31, y: 16, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S010_RIGHT_ROAD_3]: { door: TEXTURE.BLANK, x: 31, y: 17, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S010_RIGHT_ROAD_4]: { door: TEXTURE.BLANK, x: 31, y: 18, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S010_RIGHT_ROAD_5]: { door: TEXTURE.BLANK, x: 31, y: 19, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S010_DOWN_ROAD_0]: { door: TEXTURE.BLANK, x: 12, y: 43, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S010_DOWN_ROAD_1]: { door: TEXTURE.BLANK, x: 13, y: 43, offsetY: +7, width: 130, height: 102 },

  //SAFARI_011
  [OVERWORLD_DOOR.S011_UP_ROAD_0]: { door: TEXTURE.BLANK, x: 18, y: 5, offsetY: +7, width: 130, height: 102 },
  [OVERWORLD_DOOR.S011_UP_ROAD_1]: { door: TEXTURE.BLANK, x: 19, y: 5, offsetY: +7, width: 130, height: 102 },
};

export const OVERWORLD_INIT_POS_DATA: Record<OVERWORLD_INIT_POS, OverworldInitPosData> = {
  //PLAZA_001
  [OVERWORLD_INIT_POS.P001_WEST_GATE_0]: { location: TEXTURE.PLAZA_001, x: 5, y: 25 },
  [OVERWORLD_INIT_POS.P001_WEST_GATE_1]: { location: TEXTURE.PLAZA_001, x: 5, y: 26 },
  [OVERWORLD_INIT_POS.P001_SOUTH_GATE_0]: { location: TEXTURE.PLAZA_001, x: 24, y: 55 },
  [OVERWORLD_INIT_POS.P001_SOUTH_GATE_1]: { location: TEXTURE.PLAZA_001, x: 25, y: 55 },
  [OVERWORLD_INIT_POS.P001_NORTH_GATE_0]: { location: TEXTURE.PLAZA_001, x: 34, y: 5 },
  [OVERWORLD_INIT_POS.P001_NORTH_GATE_1]: { location: TEXTURE.PLAZA_001, x: 35, y: 5 },
  [OVERWORLD_INIT_POS.P001_EAST_GATE_0]: { location: TEXTURE.PLAZA_001, x: 50, y: 32 },
  [OVERWORLD_INIT_POS.P001_EAST_GATE_1]: { location: TEXTURE.PLAZA_001, x: 50, y: 33 },
  [OVERWORLD_INIT_POS.P001_LAB_0]: { location: TEXTURE.PLAZA_001, x: 12, y: 15 },
  [OVERWORLD_INIT_POS.P001_POKE_MART_0]: { location: TEXTURE.PLAZA_001, x: 16, y: 24 },
  [OVERWORLD_INIT_POS.P001_RIDE_MART_0]: { location: TEXTURE.PLAZA_001, x: 22, y: 24 },
  [OVERWORLD_INIT_POS.P001_CITY_HALL_0]: { location: TEXTURE.PLAZA_001, x: 28, y: 23 },
  [OVERWORLD_INIT_POS.P001_CITY_HALL_1]: { location: TEXTURE.PLAZA_001, x: 29, y: 23 },
  [OVERWORLD_INIT_POS.P001_NPC1_0]: { location: TEXTURE.PLAZA_001, x: 40, y: 24 },
  [OVERWORLD_INIT_POS.P001_BOUTIQUE_0]: { location: TEXTURE.PLAZA_001, x: 40, y: 31 },
  [OVERWORLD_INIT_POS.P001_NPC2_0]: { location: TEXTURE.PLAZA_001, x: 46, y: 31 },
  [OVERWORLD_INIT_POS.P001_CAFE_0]: { location: TEXTURE.PLAZA_001, x: 29, y: 40 },
  [OVERWORLD_INIT_POS.P001_MUSEUM_0]: { location: TEXTURE.PLAZA_001, x: 23, y: 49 },
  [OVERWORLD_INIT_POS.P001_BIG_MART_0]: { location: TEXTURE.PLAZA_001, x: 17, y: 39 },
  [OVERWORLD_INIT_POS.P001_NPC3_0]: { location: TEXTURE.PLAZA_001, x: 17, y: 49 },
  [OVERWORLD_INIT_POS.P001_NPC4_0]: { location: TEXTURE.PLAZA_001, x: 29, y: 49 },
  [OVERWORLD_INIT_POS.P001_CLUB_ROOM_0]: { location: TEXTURE.PLAZA_001, x: 35, y: 49 },

  //PLAZA_002
  [OVERWORLD_INIT_POS.P002_EXIT_0]: { location: TEXTURE.PLAZA_002, x: 16, y: 21 },
  [OVERWORLD_INIT_POS.P002_STAIR_0]: { location: TEXTURE.PLAZA_002, x: 32, y: 4 },

  //PLAZA_003
  [OVERWORLD_INIT_POS.P003_STAIR_0]: { location: TEXTURE.PLAZA_003, x: 27, y: 4 },

  //PLAZA_004
  [OVERWORLD_INIT_POS.P004_EXIT_0]: { location: TEXTURE.PLAZA_004, x: 7, y: 11 },

  //PLAZA_005
  [OVERWORLD_INIT_POS.P005_EXIT_0]: { location: TEXTURE.PLAZA_005, x: 7, y: 13 },

  //PLAZA_006
  [OVERWORLD_INIT_POS.P006_EXIT_0]: { location: TEXTURE.PLAZA_006, x: 9, y: 20 },

  //PLAZA_007
  [OVERWORLD_INIT_POS.P007_EXIT_0]: { location: TEXTURE.PLAZA_007, x: 9, y: 15 },
  [OVERWORLD_INIT_POS.P007_STAIR_0]: { location: TEXTURE.PLAZA_007, x: 12, y: 4 },

  //PLAZA_008
  [OVERWORLD_INIT_POS.P008_STAIR_0]: { location: TEXTURE.PLAZA_008, x: 13, y: 4 },

  //PLAZA_009
  [OVERWORLD_INIT_POS.P009_EXIT_0]: { location: TEXTURE.PLAZA_009, x: 8, y: 12 },

  //PLAZA_010
  [OVERWORLD_INIT_POS.P010_EXIT_0]: { location: TEXTURE.PLAZA_010, x: 7, y: 12 },

  //PLAZA_011
  [OVERWORLD_INIT_POS.P011_EXIT_0]: { location: TEXTURE.PLAZA_011, x: 8, y: 19 },
  [OVERWORLD_INIT_POS.P011_STAIR_0]: { location: TEXTURE.PLAZA_011, x: 3, y: 4 },
  [OVERWORLD_INIT_POS.P011_STAIR_1]: { location: TEXTURE.PLAZA_011, x: 13, y: 4 },

  //PLAZA_012
  [OVERWORLD_INIT_POS.P012_STAIR_0]: { location: TEXTURE.PLAZA_012, x: 4, y: 4 },
  [OVERWORLD_INIT_POS.P012_STAIR_1]: { location: TEXTURE.PLAZA_012, x: 12, y: 4 },

  //PLAZA_019
  [OVERWORLD_INIT_POS.P019_EXIT_0]: { location: TEXTURE.PLAZA_019, x: 1, y: 19 },

  //PLAZA_020
  [OVERWORLD_INIT_POS.P020_EXIT_0]: { location: TEXTURE.PLAZA_020, x: 8, y: 18 },
  [OVERWORLD_INIT_POS.P020_STAIR_0]: { location: TEXTURE.PLAZA_020, x: 9, y: 4 },

  //PLAZA_021
  [OVERWORLD_INIT_POS.P021_STAIR_0]: { location: TEXTURE.PLAZA_021, x: 13, y: 3 },

  //PLAZA_022
  [OVERWORLD_INIT_POS.P022_EXIT_0]: { location: TEXTURE.PLAZA_022, x: 9, y: 17 },
  [OVERWORLD_INIT_POS.P022_STAIR_0]: { location: TEXTURE.PLAZA_022, x: 3, y: 4 },

  //PLAZA_023
  [OVERWORLD_INIT_POS.P023_STAIR_0]: { location: TEXTURE.PLAZA_023, x: 15, y: 4 },

  //GATE_001
  [OVERWORLD_INIT_POS.G001_RIGHT_0]: { location: TEXTURE.GATE_001, x: 11, y: 6 },
  [OVERWORLD_INIT_POS.G001_LEFT_0]: { location: TEXTURE.GATE_001, x: 1, y: 6 },

  //GATE_002
  [OVERWORLD_INIT_POS.G002_UP_0]: { location: TEXTURE.GATE_002, x: 5, y: 2 },
  [OVERWORLD_INIT_POS.G002_DOWN_0]: { location: TEXTURE.GATE_002, x: 5, y: 12 },

  //GATE_003
  [OVERWORLD_INIT_POS.G003_RIGHT_0]: { location: TEXTURE.GATE_003, x: 11, y: 6 },
  [OVERWORLD_INIT_POS.G003_LEFT_0]: { location: TEXTURE.GATE_003, x: 1, y: 6 },

  //GATE_004
  [OVERWORLD_INIT_POS.G004_UP_0]: { location: TEXTURE.GATE_004, x: 5, y: 2 },
  [OVERWORLD_INIT_POS.G004_DOWN_0]: { location: TEXTURE.GATE_004, x: 5, y: 12 },

  //SAFARI_001
  [OVERWORLD_INIT_POS.S001_RIGHT_ROAD_0]: { location: TEXTURE.SAFARI_001, x: 65, y: 15 },
  [OVERWORLD_INIT_POS.S001_RIGHT_ROAD_1]: { location: TEXTURE.SAFARI_001, x: 65, y: 16 },
  [OVERWORLD_INIT_POS.S001_UP_ROAD_0]: { location: TEXTURE.SAFARI_001, x: 14, y: 9 },
  [OVERWORLD_INIT_POS.S001_UP_ROAD_1]: { location: TEXTURE.SAFARI_001, x: 15, y: 9 },
  [OVERWORLD_INIT_POS.S001_LEFT_ROAD_0]: { location: TEXTURE.SAFARI_001, x: 1, y: 14 },
  [OVERWORLD_INIT_POS.S001_LEFT_ROAD_1]: { location: TEXTURE.SAFARI_001, x: 1, y: 15 },
  [OVERWORLD_INIT_POS.S001_LEFT_ROAD_2]: { location: TEXTURE.SAFARI_001, x: 1, y: 16 },
  [OVERWORLD_INIT_POS.S001_LEFT_ROAD_3]: { location: TEXTURE.SAFARI_001, x: 1, y: 17 },
  [OVERWORLD_INIT_POS.S001_LEFT_ROAD_4]: { location: TEXTURE.SAFARI_001, x: 1, y: 18 },
  [OVERWORLD_INIT_POS.S001_LEFT_ROAD_5]: { location: TEXTURE.SAFARI_001, x: 1, y: 19 },

  //SAFARI_002
  [OVERWORLD_INIT_POS.S002_DOWN_ROAD_0]: { location: TEXTURE.SAFARI_002, x: 12, y: 56 },
  [OVERWORLD_INIT_POS.S002_DOWN_ROAD_1]: { location: TEXTURE.SAFARI_002, x: 13, y: 56 },
  [OVERWORLD_INIT_POS.S002_LEFT_ROAD_0]: { location: TEXTURE.SAFARI_002, x: 4, y: 26 },
  [OVERWORLD_INIT_POS.S002_LEFT_ROAD_1]: { location: TEXTURE.SAFARI_002, x: 4, y: 27 },
  [OVERWORLD_INIT_POS.S002_CAVE_0]: { location: TEXTURE.SAFARI_002, x: 24, y: 23 },

  //SAFARI_003
  [OVERWORLD_INIT_POS.S003_DOWN_ROAD_0]: { location: TEXTURE.SAFARI_003, x: 12, y: 48 },
  [OVERWORLD_INIT_POS.S003_UP_ROAD_0]: { location: TEXTURE.SAFARI_003, x: 27, y: 12 },
  [OVERWORLD_INIT_POS.S003_RIGHT_ROAD_0]: { location: TEXTURE.SAFARI_003, x: 49, y: 22 },

  //SAFARI_004
  [OVERWORLD_INIT_POS.S004_LEFT_ROAD_0]: { location: TEXTURE.SAFARI_004, x: 6, y: 21 },

  //SAFARI_005
  [OVERWORLD_INIT_POS.S005_DOWN_ROAD_0]: { location: TEXTURE.SAFARI_005, x: 21, y: 34 },
  [OVERWORLD_INIT_POS.S005_UP_ROAD_0]: { location: TEXTURE.SAFARI_005, x: 14, y: 5 },

  //SAFARI_006
  [OVERWORLD_INIT_POS.S006_DOWN_ROAD_0]: { location: TEXTURE.SAFARI_006, x: 25, y: 42 },

  //SAFARI_007
  [OVERWORLD_INIT_POS.S007_RIGHT_ROAD_0]: { location: TEXTURE.SAFARI_007, x: 75, y: 28 },
  [OVERWORLD_INIT_POS.S007_RIGHT_ROAD_1]: { location: TEXTURE.SAFARI_007, x: 75, y: 29 },
  [OVERWORLD_INIT_POS.S007_UP_ROAD_0]: { location: TEXTURE.SAFARI_007, x: 25, y: 1 },
  [OVERWORLD_INIT_POS.S007_UP_ROAD_1]: { location: TEXTURE.SAFARI_007, x: 26, y: 1 },
  [OVERWORLD_INIT_POS.S007_UP_ROAD_2]: { location: TEXTURE.SAFARI_007, x: 27, y: 1 },
  [OVERWORLD_INIT_POS.S007_UP_ROAD_3]: { location: TEXTURE.SAFARI_007, x: 28, y: 1 },
  [OVERWORLD_INIT_POS.S007_UP_ROAD_4]: { location: TEXTURE.SAFARI_007, x: 29, y: 1 },
  [OVERWORLD_INIT_POS.S007_UP_ROAD_5]: { location: TEXTURE.SAFARI_007, x: 30, y: 1 },

  //SAFARI_008
  [OVERWORLD_INIT_POS.S008_DOWN_ROAD_0]: { location: TEXTURE.SAFARI_008, x: 20, y: 42 },
  [OVERWORLD_INIT_POS.S008_DOWN_ROAD_1]: { location: TEXTURE.SAFARI_008, x: 21, y: 42 },
  [OVERWORLD_INIT_POS.S008_DOWN_ROAD_2]: { location: TEXTURE.SAFARI_008, x: 22, y: 42 },
  [OVERWORLD_INIT_POS.S008_DOWN_ROAD_3]: { location: TEXTURE.SAFARI_008, x: 23, y: 42 },
  [OVERWORLD_INIT_POS.S008_DOWN_ROAD_4]: { location: TEXTURE.SAFARI_008, x: 24, y: 42 },
  [OVERWORLD_INIT_POS.S008_DOWN_ROAD_5]: { location: TEXTURE.SAFARI_008, x: 25, y: 42 },
  [OVERWORLD_INIT_POS.S008_LEFT_ROAD_0]: { location: TEXTURE.SAFARI_008, x: 1, y: 7 },
  [OVERWORLD_INIT_POS.S008_LEFT_ROAD_1]: { location: TEXTURE.SAFARI_008, x: 1, y: 8 },
  [OVERWORLD_INIT_POS.S008_LEFT_ROAD_2]: { location: TEXTURE.SAFARI_008, x: 1, y: 9 },
  [OVERWORLD_INIT_POS.S008_LEFT_ROAD_3]: { location: TEXTURE.SAFARI_008, x: 1, y: 10 },
  [OVERWORLD_INIT_POS.S008_LEFT_ROAD_4]: { location: TEXTURE.SAFARI_008, x: 1, y: 11 },

  //SAFARI_009
  [OVERWORLD_INIT_POS.S009_RIGHT_ROAD_0]: { location: TEXTURE.SAFARI_009, x: 48, y: 12 },
  [OVERWORLD_INIT_POS.S009_RIGHT_ROAD_1]: { location: TEXTURE.SAFARI_009, x: 48, y: 13 },
  [OVERWORLD_INIT_POS.S009_RIGHT_ROAD_2]: { location: TEXTURE.SAFARI_009, x: 48, y: 14 },
  [OVERWORLD_INIT_POS.S009_RIGHT_ROAD_3]: { location: TEXTURE.SAFARI_009, x: 48, y: 15 },

  //SAFARI_010
  [OVERWORLD_INIT_POS.S010_RIGHT_ROAD_0]: { location: TEXTURE.SAFARI_010, x: 30, y: 14 },
  [OVERWORLD_INIT_POS.S010_RIGHT_ROAD_1]: { location: TEXTURE.SAFARI_010, x: 30, y: 15 },
  [OVERWORLD_INIT_POS.S010_RIGHT_ROAD_2]: { location: TEXTURE.SAFARI_010, x: 30, y: 16 },
  [OVERWORLD_INIT_POS.S010_RIGHT_ROAD_3]: { location: TEXTURE.SAFARI_010, x: 30, y: 17 },
  [OVERWORLD_INIT_POS.S010_RIGHT_ROAD_4]: { location: TEXTURE.SAFARI_010, x: 30, y: 18 },
  [OVERWORLD_INIT_POS.S010_RIGHT_ROAD_5]: { location: TEXTURE.SAFARI_010, x: 30, y: 19 },
  [OVERWORLD_INIT_POS.S010_DOWN_ROAD_0]: { location: TEXTURE.SAFARI_010, x: 12, y: 42 },
  [OVERWORLD_INIT_POS.S010_DOWN_ROAD_1]: { location: TEXTURE.SAFARI_010, x: 13, y: 42 },

  //SAFARI_011
  [OVERWORLD_INIT_POS.S011_UP_ROAD_0]: { location: TEXTURE.SAFARI_011, x: 18, y: 6 },
  [OVERWORLD_INIT_POS.S011_UP_ROAD_1]: { location: TEXTURE.SAFARI_011, x: 19, y: 6 },
};
