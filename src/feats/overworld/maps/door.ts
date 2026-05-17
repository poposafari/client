import { MAP, TEXTURE } from '@poposafari/types';

export enum DOOR {
  P001_BOUTIQUE = 'p001_boutique',
  P001_MART = 'p001_mart',
  P001_BIKE = 'p001_bike',
  P001_NPC1 = 'p001_npc1',
  P001_NPC2 = 'p001_npc2',
  P001_LAB = 'p001_lab',
  P001_NPC3 = 'p001_npc3',

  P002_DOWN_0 = 'p002_down_0',
  P002_DOWN_1 = 'p002_down_1',

  P003_DOWN_0 = 'p003_down_0',
  P003_DOWN_1 = 'p003_down_1',

  P004_DOWN_0 = 'p004_down_0',
  P004_DOWN_1 = 'p004_down_1',

  P005_DOWN_0 = 'p005_down_0',
  P005_DOWN_1 = 'p005_down_1',

  P006_DOWN_0 = 'p006_down_0',
  P006_DOWN_1 = 'p006_down_1',
  P006_RIGHT_0 = 'p006_right_0',

  P007_LEFT_0 = 'p007_left_0',
  P007_LEFT_1 = 'p007_left_1',

  P008_DOWN_0 = 'p008_down_0',
  P008_DOWN_1 = 'p008_down_1',

  P009_DOWN_0 = 'p009_down_0',
  P009_DOWN_1 = 'p009_down_1',

  S001_DOWN_0 = 's001_down_0',
  S001_DOWN_1 = 's001_down_1',
  S001_RIGHT_0 = 's001_right_0',
  S001_RIGHT_1 = 's001_right_1',
  S001_RIGHT_2 = 's001_right_2',

  S002_UP_0 = 's002_up_0',
  S002_UP_1 = 's002_up_1',
  S002_DOWN_0 = 's002_down_0',
  S002_DOWN_1 = 's002_down_1',
  S002_DOWN_2 = 's002_down_2',

  S003_LEFT_0 = 's003_left_0',
  S003_LEFT_1 = 's003_left_1',
  S003_LEFT_2 = 's003_left_2',
  S003_RIGHT_0 = 's003_right_0',
  S003_RIGHT_1 = 's003_right_1',
  S003_RIGHT_2 = 's003_right_2',
  S003_DOWN_0 = 's003_down_0',
  S003_DOWN_1 = 's003_down_1',

  S004_RIGHT_0 = 's004_right_0',
  S004_RIGHT_1 = 's004_right_1',
  S004_DOWN_0 = 's004_down_0',
  S004_DOWN_1 = 's004_down_1',
  S004_LEFT_0 = 's004_left_0',
  S004_LEFT_1 = 's004_left_1',
  S004_LEFT_2 = 's004_left_2',

  S005_UP_0 = 's005_up_0',
  S005_UP_1 = 's005_up_1',

  S006_RIGHT_0 = 's006_right_0',
  S006_RIGHT_1 = 's006_right_1',
  S006_LEFT_0 = 's006_left_0',
  S006_LEFT_1 = 's006_left_1',
  S006_UP_0 = 's006_up_0',

  S007_RIGHT_0 = 's007_right_0',
  S007_RIGHT_1 = 's007_right_1',
}

export enum INIT_POS {
  P001_BOUTIQUE = 'p001_boutique',
  P001_MART = 'p001_mart',
  P001_BIKE = 'p001_bike',
  P001_NPC1 = 'p001_npc1',
  P001_NPC2 = 'p001_npc2',
  P001_LAB = 'p001_lab',
  P001_NPC3 = 'p001_npc3',

  P002_DOWN_0 = 'p002_down_0',
  P002_DOWN_1 = 'p002_down_1',

  P003_DOWN_0 = 'p003_down_0',
  P003_DOWN_1 = 'p003_down_1',

  P004_DOWN_0 = 'p004_down_0',
  P004_DOWN_1 = 'p004_down_1',

  P005_DOWN_0 = 'p005_down_0',
  P005_DOWN_1 = 'p005_down_1',

  P006_DOWN_0 = 'p006_down_0',
  P006_DOWN_1 = 'p006_down_1',
  P006_RIGHT_0 = 'p006_right_0',

  P007_LEFT_0 = 'p007_left_0',
  P007_LEFT_1 = 'p007_left_1',

  P008_DOWN_0 = 'p008_down_0',
  P008_DOWN_1 = 'p008_down_1',

  P009_DOWN_0 = 'p009_down_0',
  P009_DOWN_1 = 'p009_down_1',

  S001_DOWN_0 = 's001_down_0',
  S001_DOWN_1 = 's001_down_1',
  S001_RIGHT_0 = 's001_right_0',
  S001_RIGHT_1 = 's001_right_1',
  S001_RIGHT_2 = 's001_right_2',

  S002_UP_0 = 's002_up_0',
  S002_UP_1 = 's002_up_1',
  S002_DOWN_0 = 's002_down_0',
  S002_DOWN_1 = 's002_down_1',
  S002_DOWN_2 = 's002_down_2',

  S003_LEFT_0 = 's003_left_0',
  S003_LEFT_1 = 's003_left_1',
  S003_LEFT_2 = 's003_left_2',
  S003_RIGHT_0 = 's003_right_0',
  S003_RIGHT_1 = 's003_right_1',
  S003_RIGHT_2 = 's003_right_2',
  S003_DOWN_0 = 's003_down_0',
  S003_DOWN_1 = 's003_down_1',

  S004_RIGHT_0 = 's004_right_0',
  S004_RIGHT_1 = 's004_right_1',
  S004_DOWN_0 = 's004_down_0',
  S004_DOWN_1 = 's004_down_1',
  S004_LEFT_0 = 's004_left_0',
  S004_LEFT_1 = 's004_left_1',
  S004_LEFT_2 = 's004_left_2',

  S005_UP_0 = 's005_up_0',
  S005_UP_1 = 's005_up_1',

  S006_RIGHT_0 = 's006_right_0',
  S006_RIGHT_1 = 's006_right_1',
  S006_LEFT_0 = 's006_left_0',
  S006_LEFT_1 = 's006_left_1',
  S006_UP_0 = 's006_up_0',

  S007_RIGHT_0 = 's007_right_0',
  S007_RIGHT_1 = 's007_right_1',
}

export interface DoorConfig {
  door: string;
  name: string;
  x: number;
  y: number;
  offsetY: number;
  /** 문 스프라이트 표시 너비(픽셀). 지정 시 setDisplaySize 적용. 미지정 시 텍스처 프레임 크기 그대로. */
  displayWidth?: number;
  /** 문 스프라이트 표시 높이(픽셀). 지정 시 setDisplaySize 적용. 미지정 시 텍스처 프레임 크기 그대로. */
  displayHeight?: number;
}

export interface InitPosConfig {
  location: MAP;
  x: number;
  y: number;
}

export const OVERWORLD_DOOR: Record<DOOR, DoorConfig> = {
  [DOOR.P001_BOUTIQUE]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 29,
    y: 27,
    offsetY: 0,
  },
  [DOOR.P001_MART]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 36,
    y: 27,
    offsetY: 0,
  },
  [DOOR.P001_BIKE]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 44,
    y: 27,
    offsetY: 0,
  },
  [DOOR.P001_NPC1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 54,
    y: 27,
    offsetY: 0,
  },
  [DOOR.P001_NPC2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 44,
    y: 41,
    offsetY: 0,
  },
  [DOOR.P001_LAB]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 32,
    y: 41,
    offsetY: 0,
  },
  [DOOR.P001_NPC3]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 29,
    y: 50,
    offsetY: 0,
  },
  [DOOR.P002_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 6,
    y: 14,
    offsetY: 0,
  },
  [DOOR.P002_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 7,
    y: 14,
    offsetY: 0,
  },
  [DOOR.P003_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 6,
    y: 11,
    offsetY: 0,
  },
  [DOOR.P003_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 7,
    y: 11,
    offsetY: 0,
  },
  [DOOR.P004_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 6,
    y: 11,
    offsetY: 0,
  },
  [DOOR.P004_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 7,
    y: 11,
    offsetY: 0,
  },
  [DOOR.P005_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 6,
    y: 11,
    offsetY: 0,
  },
  [DOOR.P005_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 7,
    y: 11,
    offsetY: 0,
  },
  [DOOR.P006_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 7,
    y: 15,
    offsetY: 0,
  },
  [DOOR.P006_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 8,
    y: 15,
    offsetY: 0,
  },
  [DOOR.P006_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 10,
    y: 3,
    offsetY: 0,
  },
  [DOOR.P007_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 5,
    y: 3,
    offsetY: 0,
  },
  [DOOR.P007_LEFT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 5,
    y: 4,
    offsetY: 0,
  },
  [DOOR.P008_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 10,
    y: 15,
    offsetY: 0,
  },
  [DOOR.P008_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 11,
    y: 15,
    offsetY: 0,
  },
  [DOOR.P009_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 1,
    y: 16,
    offsetY: 0,
  },
  [DOOR.P009_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 2,
    y: 16,
    offsetY: 0,
  },

  [DOOR.S001_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 22,
    y: 35,
    offsetY: 0,
  },
  [DOOR.S001_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 23,
    y: 35,
    offsetY: 0,
  },
  [DOOR.S001_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 48,
    y: 19,
    offsetY: 0,
  },
  [DOOR.S001_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 48,
    y: 20,
    offsetY: 0,
  },
  [DOOR.S001_RIGHT_2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 48,
    y: 21,
    offsetY: 0,
  },

  [DOOR.S002_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 35,
    y: 11,
    offsetY: 0,
  },
  [DOOR.S002_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 36,
    y: 11,
    offsetY: 0,
  },
  [DOOR.S002_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 29,
    y: 48,
    offsetY: 0,
  },
  [DOOR.S002_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 29,
    y: 49,
    offsetY: 0,
  },
  [DOOR.S002_DOWN_2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 29,
    y: 50,
    offsetY: 0,
  },

  [DOOR.S003_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 15,
    y: 21,
    offsetY: 0,
  },
  [DOOR.S003_LEFT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 15,
    y: 22,
    offsetY: 0,
  },
  [DOOR.S003_LEFT_2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 15,
    y: 23,
    offsetY: 0,
  },
  [DOOR.S003_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 48,
    y: 36,
    offsetY: 0,
  },
  [DOOR.S003_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 48,
    y: 37,
    offsetY: 0,
  },
  [DOOR.S003_RIGHT_2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 48,
    y: 38,
    offsetY: 0,
  },
  [DOOR.S003_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 29,
    y: 46,
    offsetY: 0,
  },
  [DOOR.S003_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 30,
    y: 46,
    offsetY: 0,
  },

  [DOOR.S004_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 56,
    y: 28,
    offsetY: 0,
  },
  [DOOR.S004_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 56,
    y: 29,
    offsetY: 0,
  },
  [DOOR.S004_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 28,
    y: 50,
    offsetY: 0,
  },
  [DOOR.S004_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 29,
    y: 50,
    offsetY: 0,
  },
  [DOOR.S004_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 19,
    y: 21,
    offsetY: 0,
  },
  [DOOR.S004_LEFT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 19,
    y: 22,
    offsetY: 0,
  },
  [DOOR.S004_LEFT_2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 19,
    y: 23,
    offsetY: 0,
  },
  [DOOR.S005_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 26,
    y: 9,
    offsetY: 0,
  },
  [DOOR.S005_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 27,
    y: 9,
    offsetY: 0,
  },

  [DOOR.S006_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 63,
    y: 24,
    offsetY: 0,
  },
  [DOOR.S006_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 63,
    y: 25,
    offsetY: 0,
  },
  [DOOR.S006_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 15,
    y: 26,
    offsetY: 0,
  },
  [DOOR.S006_LEFT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 15,
    y: 27,
    offsetY: 0,
  },
  [DOOR.S006_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 17,
    y: 11,
    offsetY: 0,
  },
  [DOOR.S007_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 48,
    y: 32,
    offsetY: 0,
  },
  [DOOR.S007_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 48,
    y: 33,
    offsetY: 0,
  },
};

export const OVERWORLD_INIT_POS: Record<INIT_POS, InitPosConfig> = {
  [INIT_POS.P001_BOUTIQUE]: {
    location: MAP.PLAZA_001,
    x: 29,
    y: 28,
  },
  [INIT_POS.P001_MART]: {
    location: MAP.PLAZA_001,
    x: 36,
    y: 28,
  },
  [INIT_POS.P001_BIKE]: {
    location: MAP.PLAZA_001,
    x: 44,
    y: 28,
  },
  [INIT_POS.P001_NPC1]: {
    location: MAP.PLAZA_001,
    x: 54,
    y: 28,
  },
  [INIT_POS.P001_NPC2]: {
    location: MAP.PLAZA_001,
    x: 44,
    y: 42,
  },
  [INIT_POS.P001_LAB]: {
    location: MAP.PLAZA_001,
    x: 32,
    y: 42,
  },
  [INIT_POS.P001_NPC3]: {
    location: MAP.PLAZA_001,
    x: 29,
    y: 51,
  },
  [INIT_POS.P002_DOWN_0]: {
    location: MAP.PLAZA_002,
    x: 6,
    y: 13,
  },
  [INIT_POS.P002_DOWN_1]: {
    location: MAP.PLAZA_002,
    x: 7,
    y: 13,
  },
  [INIT_POS.P003_DOWN_0]: {
    location: MAP.PLAZA_003,
    x: 6,
    y: 10,
  },
  [INIT_POS.P003_DOWN_1]: {
    location: MAP.PLAZA_003,
    x: 7,
    y: 10,
  },
  [INIT_POS.P004_DOWN_0]: {
    location: MAP.PLAZA_004,
    x: 6,
    y: 10,
  },
  [INIT_POS.P004_DOWN_1]: {
    location: MAP.PLAZA_004,
    x: 7,
    y: 10,
  },
  [INIT_POS.P005_DOWN_0]: {
    location: MAP.PLAZA_005,
    x: 6,
    y: 10,
  },
  [INIT_POS.P005_DOWN_1]: {
    location: MAP.PLAZA_005,
    x: 7,
    y: 10,
  },
  [INIT_POS.P006_DOWN_0]: {
    location: MAP.PLAZA_006,
    x: 7,
    y: 14,
  },
  [INIT_POS.P006_DOWN_1]: {
    location: MAP.PLAZA_006,
    x: 8,
    y: 14,
  },
  [INIT_POS.P006_RIGHT_0]: {
    location: MAP.PLAZA_006,
    x: 9,
    y: 3,
  },
  [INIT_POS.P007_LEFT_0]: {
    location: MAP.PLAZA_007,
    x: 6,
    y: 3,
  },
  [INIT_POS.P007_LEFT_1]: {
    location: MAP.PLAZA_007,
    x: 6,
    y: 4,
  },
  [INIT_POS.P008_DOWN_0]: {
    location: MAP.PLAZA_008,
    x: 10,
    y: 14,
  },
  [INIT_POS.P008_DOWN_1]: {
    location: MAP.PLAZA_008,
    x: 11,
    y: 14,
  },
  [INIT_POS.P009_DOWN_0]: {
    location: MAP.PLAZA_009,
    x: 1,
    y: 15,
  },
  [INIT_POS.P009_DOWN_1]: {
    location: MAP.PLAZA_009,
    x: 1,
    y: 16,
  },

  [INIT_POS.S001_DOWN_0]: {
    location: MAP.SAFARI_001,
    x: 22,
    y: 34,
  },
  [INIT_POS.S001_DOWN_1]: {
    location: MAP.SAFARI_001,
    x: 23,
    y: 34,
  },
  [INIT_POS.S001_RIGHT_0]: {
    location: MAP.SAFARI_001,
    x: 47,
    y: 19,
  },
  [INIT_POS.S001_RIGHT_1]: {
    location: MAP.SAFARI_001,
    x: 47,
    y: 20,
  },
  [INIT_POS.S001_RIGHT_2]: {
    location: MAP.SAFARI_001,
    x: 47,
    y: 21,
  },

  [INIT_POS.S002_UP_0]: {
    location: MAP.SAFARI_002,
    x: 35,
    y: 12,
  },
  [INIT_POS.S002_UP_1]: {
    location: MAP.SAFARI_002,
    x: 36,
    y: 12,
  },
  [INIT_POS.S002_DOWN_0]: {
    location: MAP.SAFARI_002,
    x: 30,
    y: 48,
  },
  [INIT_POS.S002_DOWN_1]: {
    location: MAP.SAFARI_002,
    x: 30,
    y: 49,
  },
  [INIT_POS.S002_DOWN_2]: {
    location: MAP.SAFARI_002,
    x: 30,
    y: 50,
  },

  [INIT_POS.S003_LEFT_0]: {
    location: MAP.SAFARI_003,
    x: 16,
    y: 21,
  },
  [INIT_POS.S003_LEFT_1]: {
    location: MAP.SAFARI_003,
    x: 16,
    y: 22,
  },
  [INIT_POS.S003_LEFT_2]: {
    location: MAP.SAFARI_003,
    x: 16,
    y: 23,
  },
  [INIT_POS.S003_RIGHT_0]: {
    location: MAP.SAFARI_003,
    x: 47,
    y: 36,
  },
  [INIT_POS.S003_RIGHT_1]: {
    location: MAP.SAFARI_003,
    x: 47,
    y: 37,
  },
  [INIT_POS.S003_RIGHT_2]: {
    location: MAP.SAFARI_003,
    x: 47,
    y: 38,
  },
  [INIT_POS.S003_DOWN_0]: {
    location: MAP.SAFARI_003,
    x: 29,
    y: 45,
  },
  [INIT_POS.S003_DOWN_1]: {
    location: MAP.SAFARI_003,
    x: 30,
    y: 45,
  },
  [INIT_POS.S004_RIGHT_0]: {
    location: MAP.SAFARI_004,
    x: 55,
    y: 28,
  },
  [INIT_POS.S004_RIGHT_1]: {
    location: MAP.SAFARI_004,
    x: 55,
    y: 29,
  },
  [INIT_POS.S004_DOWN_0]: {
    location: MAP.SAFARI_004,
    x: 28,
    y: 49,
  },
  [INIT_POS.S004_DOWN_1]: {
    location: MAP.SAFARI_004,
    x: 29,
    y: 49,
  },
  [INIT_POS.S004_LEFT_0]: {
    location: MAP.SAFARI_004,
    x: 20,
    y: 21,
  },
  [INIT_POS.S004_LEFT_1]: {
    location: MAP.SAFARI_004,
    x: 20,
    y: 22,
  },
  [INIT_POS.S004_LEFT_2]: {
    location: MAP.SAFARI_004,
    x: 20,
    y: 23,
  },
  [INIT_POS.S005_UP_0]: {
    location: MAP.SAFARI_005,
    x: 26,
    y: 10,
  },
  [INIT_POS.S005_UP_1]: {
    location: MAP.SAFARI_005,
    x: 27,
    y: 10,
  },
  [INIT_POS.S006_RIGHT_0]: {
    location: MAP.SAFARI_006,
    x: 62,
    y: 24,
  },
  [INIT_POS.S006_RIGHT_1]: {
    location: MAP.SAFARI_006,
    x: 62,
    y: 25,
  },
  [INIT_POS.S006_LEFT_0]: {
    location: MAP.SAFARI_006,
    x: 16,
    y: 26,
  },
  [INIT_POS.S006_LEFT_1]: {
    location: MAP.SAFARI_006,
    x: 16,
    y: 27,
  },
  [INIT_POS.S006_UP_0]: {
    location: MAP.SAFARI_006,
    x: 17,
    y: 12,
  },
  [INIT_POS.S007_RIGHT_0]: {
    location: MAP.SAFARI_007,
    x: 47,
    y: 32,
  },
  [INIT_POS.S007_RIGHT_1]: {
    location: MAP.SAFARI_007,
    x: 47,
    y: 33,
  },
};
