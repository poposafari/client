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

  S008_DOWN_0 = 's008_down_0',
  S008_LEFT_0 = 's008_left_0',
  S008_UP_0 = 's008_up_0',

  S009_RIGHT_0 = 's009_right_0',
  S009_LEFT_0 = 's009_left_0',
  S009_UP_0 = 's009_up_0',

  S010_RIGHT_0 = 's010_right_0',

  S011_DOWN_0 = 's011_down_0',

  S012_DOWN_0 = 's012_down_0',

  S013_LEFT_0 = 's013_left_0',
  S013_LEFT_1 = 's013_left_1',
  S013_RIGHT_0 = 's013_right_0',
  S013_RIGHT_1 = 's013_right_1',

  S014_LEFT_0 = 's014_left_0',
  S014_LEFT_1 = 's014_left_1',
  S014_UP_0 = 's014_up_0',
  S014_RIGHT_0 = 's014_right_0',

  S015_DOWN_0 = 's015_down_0',
  S015_LEFT_0 = 's015_left_0',

  S016_UP_0 = 's016_up_0',
  S016_UP_1 = 's016_up_1',
  S016_UP_2 = 's016_up_2',
  S016_LEFT_0 = 's016_left_0',
  S016_RIGHT_0 = 's016_right_0',

  S017_UP_0 = 's017_up_0',
  S017_UP_1 = 's017_up_1',
  S017_RIGHT_0 = 's017_right_0',

  S018_DOWN_0 = 's018_down_0',
  S018_UP_0 = 's018_up_0',
  S018_LEFT_0 = 's018_left_0',

  S019_UP_0 = 's019_up_0',
  S019_DOWN_0 = 's019_down_0',
  S019_RIGHT_0 = 's019_right_0',
  S019_RIGHT_1 = 's019_right_1',

  S020_DOWN_0 = 's020_down_0',
  S020_RIGHT_0 = 's20_right_0',

  S021_LEFT_0 = 's021_left_0',
  S021_UP_0 = 's021_up_0',
  S021_UP_1 = 's021_up_1',
  S021_DOWN_0 = 's021_down_0',
  S021_DOWN_1 = 's021_down_1',

  S022_UP_0 = 's022_up_0',
  S022_UP_1 = 's022_up_1',

  S023_UP_0 = 's023_up_0',
  S023_UP_1 = 's023_up_1',
  S023_RIGHT_0 = 's023_right_0',

  S024_LEFT_0 = 's024_left_0',
  S024_UP_0 = 's024_up_0',
  S024_RIGHT_0 = 's024_right_0',
  S024_RIGHT_1 = 's024_right_1',

  S025_DOWN_0 = 's025_down_0',
  S025_LEFT_0 = 's025_left_0',
  S025_UP_0 = 's025_up_0',
  S025_UP_1 = 's025_up_1',
  S025_UP_2 = 's025_up_2',

  S026_RIGHT_0 = 's026_right_0',

  S027_DOWN_0 = 's027_down_0',

  S028_UP_0 = 's028_up_0',

  S029_LEFT_0 = 's029_left_0',
  S029_UP_0 = 's029_up_0',
  S029_UP_1 = 's029_up_1',
  S029_DOWN_0 = 's029_down_0',
  S029_DOWN_1 = 's029_down_1',

  S030_UP_0 = 's030_up_0',

  S031_UP_0 = 's031_up_0',

  S032_LEFT_0 = 's032_left_0',
  S032_RIGHT_0 = 's032_right_0',
  S032_DOWN_0 = 's032_down_0',
  S032_DOWN_1 = 's032_down_1',

  S033_UP_0 = 's033_up_0',
  S033_DOWN_0 = 's033_down_0',
  S033_DOWN_1 = 's033_down_1',

  S034_LEFT_0 = 's034_left_0',
  S034_UP_0 = 's034_up_0',
  S034_RIGHT_0 = 's034_right_0',

  S035_LEFT_0 = 's035_left_0',
  S035_UP_0 = 's035_up_0',
  S035_UP_1 = 's035_up_1',
  S035_DOWN_0 = 's035_down_0',
  S035_DOWN_1 = 's035_down_1',
  S035_RIGHT_0 = 's035_right_0',

  S036_UP_0 = 's036_up_0',

  S037_UP_0 = 's037_up_0',

  S038_UP_0 = 's038_up_0',

  S039_LEFT_0 = 's039_left_0',
  S039_RIGHT_0 = 's039_right_0',
  S039_RIGHT_1 = 's039_right_1',
  S039_RIGHT_2 = 's039_right_2',

  S040_LEFT_0 = 's040_left_0',
  S040_LEFT_1 = 's040_left_1',
  S040_LEFT_2 = 's040_left_2',
  S040_UP_0 = 's040_up_0',
  S040_RIGHT_0 = 's040_right_0',

  S041_DOWN_0 = 's041_down_0',

  S042_LEFT_0 = 's042_left_0',
  S042_RIGHT_0 = 's042_right_0',
  S042_RIGHT_1 = 's042_right_1',

  S043_UP_0 = 's043_up_0',
  S043_LEFT_0 = 's043_left_0',
  S043_LEFT_1 = 's043_left_1',
  S043_RIGHT_0 = 's043_right_0',

  S044_UP_0 = 's044_up_0',

  S045_LEFT_0 = 's045_left_0',

  S046_UP_0 = 's046_up_0',
  S046_UP_1 = 's046_up_1',
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

  S008_DOWN_0 = 's008_down_0',
  S008_LEFT_0 = 's008_left_0',
  S008_UP_0 = 's008_up_0',

  S009_RIGHT_0 = 's009_right_0',
  S009_LEFT_0 = 's009_left_0',
  S009_UP_0 = 's009_up_0',

  S010_RIGHT_0 = 's010_right_0',

  S011_DOWN_0 = 's011_down_0',

  S012_DOWN_0 = 's012_down_0',

  S013_LEFT_0 = 's013_left_0',
  S013_LEFT_1 = 's013_left_1',
  S013_RIGHT_0 = 's013_right_0',
  S013_RIGHT_1 = 's013_right_1',

  S014_LEFT_0 = 's014_left_0',
  S014_LEFT_1 = 's014_left_1',
  S014_UP_0 = 's014_up_0',
  S014_RIGHT_0 = 's014_right_0',

  S015_DOWN_0 = 's015_down_0',
  S015_LEFT_0 = 's015_left_0',

  S016_UP_0 = 's016_up_0',
  S016_UP_1 = 's016_up_1',
  S016_UP_2 = 's016_up_2',
  S016_LEFT_0 = 's016_left_0',
  S016_RIGHT_0 = 's016_right_0',

  S017_UP_0 = 's017_up_0',
  S017_UP_1 = 's017_up_1',
  S017_RIGHT_0 = 's017_right_0',

  S018_DOWN_0 = 's018_down_0',
  S018_UP_0 = 's018_up_0',
  S018_LEFT_0 = 's018_left_0',

  S019_UP_0 = 's019_up_0',
  S019_DOWN_0 = 's019_down_0',
  S019_RIGHT_0 = 's019_right_0',
  S019_RIGHT_1 = 's019_right_1',

  S020_DOWN_0 = 's020_down_0',
  S020_RIGHT_0 = 's20_right_0',

  S021_LEFT_0 = 's021_left_0',
  S021_UP_0 = 's021_up_0',
  S021_UP_1 = 's021_up_1',
  S021_DOWN_0 = 's021_down_0',
  S021_DOWN_1 = 's021_down_1',

  S022_UP_0 = 's022_up_0',
  S022_UP_1 = 's022_up_1',

  S023_UP_0 = 's023_up_0',
  S023_UP_1 = 's023_up_1',
  S023_RIGHT_0 = 's023_right_0',

  S024_LEFT_0 = 's024_left_0',
  S024_UP_0 = 's024_up_0',
  S024_RIGHT_0 = 's024_right_0',

  S025_DOWN_0 = 's025_down_0',
  S025_LEFT_0 = 's025_left_0',
  S025_UP_0 = 's025_up_0',
  S025_UP_1 = 's025_up_1',

  S026_RIGHT_0 = 's026_right_0',

  S027_DOWN_0 = 's027_down_0',

  S028_UP_0 = 's028_up_0',

  S029_LEFT_0 = 's029_left_0',
  S029_UP_0 = 's029_up_0',
  S029_DOWN_0 = 's029_down_0',

  S030_UP_0 = 's030_up_0',

  S031_UP_0 = 's031_up_0',

  S032_LEFT_0 = 's032_left_0',
  S032_RIGHT_0 = 's032_right_0',
  S032_DOWN_0 = 's032_down_0',

  S033_UP_0 = 's033_up_0',
  S033_DOWN_0 = 's033_down_0',
  S033_DOWN_1 = 's033_down_1',

  S034_LEFT_0 = 's034_left_0',
  S034_UP_0 = 's034_up_0',
  S034_RIGHT_0 = 's034_right_0',

  S035_LEFT_0 = 's035_left_0',
  S035_UP_0 = 's035_up_0',
  S035_DOWN_0 = 's035_down_0',
  S035_RIGHT_0 = 's035_right_0',

  S036_UP_0 = 's036_up_0',

  S037_UP_0 = 's037_up_0',

  S038_UP_0 = 's038_up_0',

  S039_LEFT_0 = 's039_left_0',
  S039_RIGHT_0 = 's039_right_0',
  S039_RIGHT_1 = 's039_right_1',
  S039_RIGHT_2 = 's039_right_2',

  S040_LEFT_0 = 's040_left_0',
  S040_LEFT_1 = 's040_left_1',
  S040_LEFT_2 = 's040_left_2',
  S040_UP_0 = 's040_up_0',
  S040_RIGHT_0 = 's040_right_0',

  S041_DOWN_0 = 's041_down_0',

  S042_LEFT_0 = 's042_left_0',
  S042_RIGHT_0 = 's042_right_0',

  S043_UP_0 = 's043_up_0',
  S043_LEFT_0 = 's043_left_0',
  S043_RIGHT_0 = 's043_right_0',

  S044_UP_0 = 's044_up_0',

  S045_LEFT_0 = 's045_left_0',

  S046_UP_0 = 's046_up_0',
  S046_UP_1 = 's046_up_1',
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
    y: 36,
    offsetY: 0,
  },
  [DOOR.S001_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 23,
    y: 36,
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

  [DOOR.S008_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 39,
    y: 58,
    offsetY: 0,
  },
  [DOOR.S008_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 4,
    y: 21,
    offsetY: 0,
  },
  [DOOR.S008_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 21,
    y: 4,
    offsetY: 0,
  },
  [DOOR.S009_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 55,
    y: 21,
    offsetY: 0,
  },
  [DOOR.S009_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 9,
    y: 19,
    offsetY: 0,
  },
  [DOOR.S009_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 23,
    y: 7,
    offsetY: 0,
  },
  [DOOR.S010_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 46,
    y: 15,
    offsetY: 0,
  },
  [DOOR.S011_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 23,
    y: 38,
    offsetY: 0,
  },
  [DOOR.S012_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 25,
    y: 50,
    offsetY: 0,
  },
  [DOOR.S013_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 15,
    y: 18,
    offsetY: 0,
  },
  [DOOR.S013_LEFT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 15,
    y: 19,
    offsetY: 0,
  },
  [DOOR.S013_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 66,
    y: 20,
    offsetY: 0,
  },
  [DOOR.S013_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 66,
    y: 21,
    offsetY: 0,
  },
  [DOOR.S014_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 13,
    y: 42,
    offsetY: 0,
  },
  [DOOR.S014_LEFT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 13,
    y: 43,
    offsetY: 0,
  },
  [DOOR.S014_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 42,
    y: 14,
    offsetY: 0,
  },
  [DOOR.S014_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 45,
    y: 59,
    offsetY: 0,
  },
  [DOOR.S015_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 26,
    y: 33,
    offsetY: 0,
  },
  [DOOR.S015_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 1,
    y: 18,
    offsetY: 0,
  },

  [DOOR.S016_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 9,
    y: 6,
    offsetY: 0,
  },
  [DOOR.S016_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 18,
    y: 2,
    offsetY: 0,
  },
  [DOOR.S016_UP_2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 27,
    y: 6,
    offsetY: 0,
  },
  [DOOR.S016_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 6,
    y: 31,
    offsetY: 0,
  },
  [DOOR.S016_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 44,
    y: 25,
    offsetY: 0,
  },
  [DOOR.S017_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 25,
    y: 18,
    offsetY: 0,
  },
  [DOOR.S017_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 42,
    y: 18,
    offsetY: 0,
  },
  [DOOR.S017_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 18,
    y: 34,
    offsetY: 0,
  },
  [DOOR.S018_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 52,
    y: 37,
    offsetY: 0,
  },
  [DOOR.S018_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 14,
    y: 3,
    offsetY: 0,
  },
  [DOOR.S018_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 46,
    y: 5,
    offsetY: 0,
  },

  [DOOR.S019_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 38,
    y: 9,
    offsetY: 0,
  },
  [DOOR.S019_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 28,
    y: 14,
    offsetY: 0,
  },
  [DOOR.S019_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 66,
    y: 20,
    offsetY: 0,
  },
  [DOOR.S019_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 70,
    y: 37,
    offsetY: 0,
  },

  [DOOR.S020_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 8,
    y: 35,
    offsetY: 0,
  },
  [DOOR.S020_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 41,
    y: 7,
    offsetY: 0,
  },

  [DOOR.S021_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 19,
    y: 21,
    offsetY: 0,
  },
  [DOOR.S021_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 35,
    y: 12,
    offsetY: 0,
  },
  [DOOR.S021_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 36,
    y: 12,
    offsetY: 0,
  },
  [DOOR.S021_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 56,
    y: 41,
    offsetY: 0,
  },
  [DOOR.S021_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 57,
    y: 41,
    offsetY: 0,
  },

  [DOOR.S022_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 23,
    y: 42,
    offsetY: 0,
  },
  [DOOR.S022_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 24,
    y: 42,
    offsetY: 0,
  },

  [DOOR.S023_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 21,
    y: 9,
    offsetY: 0,
  },
  [DOOR.S023_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 22,
    y: 9,
    offsetY: 0,
  },
  [DOOR.S023_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 57,
    y: 13,
    offsetY: 0,
  },

  [DOOR.S024_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 1,
    y: 24,
    offsetY: 0,
  },
  [DOOR.S024_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 34,
    y: 2,
    offsetY: 0,
  },
  [DOOR.S024_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 45,
    y: 15,
    offsetY: 0,
  },
  [DOOR.S024_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 45,
    y: 16,
    offsetY: 0,
  },

  [DOOR.S025_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 40,
    y: 38,
    offsetY: 0,
  },
  [DOOR.S025_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 11,
    y: 19,
    offsetY: 0,
  },
  [DOOR.S025_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 18,
    y: 5,
    offsetY: 0,
  },
  [DOOR.S025_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 18,
    y: 6,
    offsetY: 0,
  },
  [DOOR.S025_UP_2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 31,
    y: 15,
    offsetY: 0,
  },
  [DOOR.S026_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 37,
    y: 16,
    offsetY: 0,
  },
  [DOOR.S027_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 9,
    y: 8,
    offsetY: 0,
  },
  [DOOR.S028_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 8,
    y: 3,
    offsetY: 0,
  },
  [DOOR.S029_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 7,
    y: 30,
    offsetY: 0,
  },
  [DOOR.S029_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 23,
    y: 9,
    offsetY: 0,
  },
  [DOOR.S029_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 23,
    y: 10,
    offsetY: 0,
  },
  [DOOR.S029_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 32,
    y: 35,
    offsetY: 0,
  },
  [DOOR.S029_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 32,
    y: 36,
    offsetY: 0,
  },

  [DOOR.S030_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 4,
    y: 3,
    offsetY: 0,
  },

  [DOOR.S031_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 29,
    y: 4,
    offsetY: 0,
  },

  [DOOR.S032_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 2,
    y: 8,
    offsetY: 0,
  },
  [DOOR.S032_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 22,
    y: 11,
    offsetY: 0,
  },
  [DOOR.S032_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 15,
    y: 16,
    offsetY: 0,
  },
  [DOOR.S032_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 15,
    y: 17,
    offsetY: 0,
  },

  [DOOR.S033_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 4,
    y: 3,
    offsetY: 0,
  },
  [DOOR.S033_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 27,
    y: 21,
    offsetY: 0,
  },
  [DOOR.S033_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 44,
    y: 28,
    offsetY: 0,
  },

  [DOOR.S034_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 8,
    y: 6,
    offsetY: 0,
  },
  [DOOR.S034_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 32,
    y: 5,
    offsetY: 0,
  },
  [DOOR.S034_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 53,
    y: 5,
    offsetY: 0,
  },

  [DOOR.S035_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 4,
    y: 13,
    offsetY: 0,
  },
  [DOOR.S035_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 22,
    y: 7,
    offsetY: 0,
  },
  [DOOR.S035_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 22,
    y: 6,
    offsetY: 0,
  },
  [DOOR.S035_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 27,
    y: 41,
    offsetY: 0,
  },
  [DOOR.S035_DOWN_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 27,
    y: 42,
    offsetY: 0,
  },
  [DOOR.S035_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 44,
    y: 16,
    offsetY: 0,
  },

  [DOOR.S036_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 8,
    y: 3,
    offsetY: 0,
  },

  [DOOR.S037_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 28,
    y: 6,
    offsetY: 0,
  },

  [DOOR.S038_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 24,
    y: 3,
    offsetY: 0,
  },

  [DOOR.S039_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 14,
    y: 20,
    offsetY: 0,
  },
  [DOOR.S039_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 58,
    y: 21,
    offsetY: 0,
  },
  [DOOR.S039_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 58,
    y: 22,
    offsetY: 0,
  },
  [DOOR.S039_RIGHT_2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 58,
    y: 23,
    offsetY: 0,
  },

  [DOOR.S040_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 13,
    y: 12,
    offsetY: 0,
  },
  [DOOR.S040_LEFT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 13,
    y: 13,
    offsetY: 0,
  },
  [DOOR.S040_LEFT_2]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 13,
    y: 14,
    offsetY: 0,
  },
  [DOOR.S040_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 47,
    y: 15,
    offsetY: 0,
  },
  [DOOR.S040_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 56,
    y: 31,
    offsetY: 0,
  },

  [DOOR.S041_DOWN_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 16,
    y: 38,
    offsetY: 0,
  },

  [DOOR.S042_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 6,
    y: 31,
    offsetY: 0,
  },
  [DOOR.S042_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 52,
    y: 22,
    offsetY: 0,
  },
  [DOOR.S042_RIGHT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 52,
    y: 23,
    offsetY: 0,
  },

  [DOOR.S043_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 34,
    y: 6,
    offsetY: 0,
  },
  [DOOR.S043_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 10,
    y: 28,
    offsetY: 0,
  },
  [DOOR.S043_LEFT_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 10,
    y: 29,
    offsetY: 0,
  },
  [DOOR.S043_RIGHT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 57,
    y: 23,
    offsetY: 0,
  },

  [DOOR.S044_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 20,
    y: 4,
    offsetY: 0,
  },

  [DOOR.S045_LEFT_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 7,
    y: 18,
    offsetY: 0,
  },

  [DOOR.S046_UP_0]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 47,
    y: 9,
    offsetY: 0,
  },
  [DOOR.S046_UP_1]: {
    door: TEXTURE.BLANK,
    name: '',
    x: 48,
    y: 9,
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
    y: 35,
  },
  [INIT_POS.S001_DOWN_1]: {
    location: MAP.SAFARI_001,
    x: 23,
    y: 35,
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
  [INIT_POS.S008_DOWN_0]: {
    location: MAP.SAFARI_008,
    x: 39,
    y: 57,
  },
  [INIT_POS.S008_LEFT_0]: {
    location: MAP.SAFARI_008,
    x: 5,
    y: 21,
  },
  [INIT_POS.S008_UP_0]: {
    location: MAP.SAFARI_008,
    x: 21,
    y: 5,
  },
  [INIT_POS.S009_RIGHT_0]: {
    location: MAP.SAFARI_009,
    x: 54,
    y: 21,
  },
  [INIT_POS.S009_LEFT_0]: {
    location: MAP.SAFARI_009,
    x: 10,
    y: 19,
  },
  [INIT_POS.S009_UP_0]: {
    location: MAP.SAFARI_009,
    x: 23,
    y: 8,
  },
  [INIT_POS.S010_RIGHT_0]: {
    location: MAP.SAFARI_010,
    x: 45,
    y: 15,
  },
  [INIT_POS.S011_DOWN_0]: {
    location: MAP.SAFARI_011,
    x: 23,
    y: 37,
  },
  [INIT_POS.S012_DOWN_0]: {
    location: MAP.SAFARI_012,
    x: 25,
    y: 49,
  },
  [INIT_POS.S013_LEFT_0]: {
    location: MAP.SAFARI_013,
    x: 16,
    y: 18,
  },
  [INIT_POS.S013_LEFT_1]: {
    location: MAP.SAFARI_013,
    x: 16,
    y: 19,
  },
  [INIT_POS.S013_RIGHT_0]: {
    location: MAP.SAFARI_013,
    x: 65,
    y: 20,
  },
  [INIT_POS.S013_RIGHT_1]: {
    location: MAP.SAFARI_013,
    x: 65,
    y: 21,
  },
  [INIT_POS.S014_LEFT_0]: {
    location: MAP.SAFARI_014,
    x: 14,
    y: 42,
  },
  [INIT_POS.S014_LEFT_1]: {
    location: MAP.SAFARI_014,
    x: 14,
    y: 43,
  },
  [INIT_POS.S014_UP_0]: {
    location: MAP.SAFARI_014,
    x: 42,
    y: 15,
  },
  [INIT_POS.S014_RIGHT_0]: {
    location: MAP.SAFARI_014,
    x: 44,
    y: 59,
  },
  [INIT_POS.S015_DOWN_0]: {
    location: MAP.SAFARI_015,
    x: 26,
    y: 32,
  },
  [INIT_POS.S015_LEFT_0]: {
    location: MAP.SAFARI_015,
    x: 2,
    y: 18,
  },
  [INIT_POS.S016_UP_0]: {
    location: MAP.SAFARI_016,
    x: 9,
    y: 7,
  },
  [INIT_POS.S016_UP_1]: {
    location: MAP.SAFARI_016,
    x: 18,
    y: 3,
  },
  [INIT_POS.S016_UP_2]: {
    location: MAP.SAFARI_016,
    x: 27,
    y: 7,
  },
  [INIT_POS.S016_LEFT_0]: {
    location: MAP.SAFARI_016,
    x: 7,
    y: 31,
  },
  [INIT_POS.S016_RIGHT_0]: {
    location: MAP.SAFARI_016,
    x: 43,
    y: 25,
  },
  [INIT_POS.S017_UP_0]: {
    location: MAP.SAFARI_017,
    x: 25,
    y: 17,
  },
  [INIT_POS.S017_UP_1]: {
    location: MAP.SAFARI_017,
    x: 42,
    y: 17,
  },
  [INIT_POS.S017_RIGHT_0]: {
    location: MAP.SAFARI_017,
    x: 17,
    y: 34,
  },
  [INIT_POS.S018_DOWN_0]: {
    location: MAP.SAFARI_018,
    x: 52,
    y: 36,
  },
  [INIT_POS.S018_UP_0]: {
    location: MAP.SAFARI_018,
    x: 14,
    y: 4,
  },
  [INIT_POS.S018_LEFT_0]: {
    location: MAP.SAFARI_018,
    x: 45,
    y: 5,
  },

  [INIT_POS.S019_UP_0]: {
    location: MAP.SAFARI_019,
    x: 38,
    y: 10,
  },
  [INIT_POS.S019_DOWN_0]: {
    location: MAP.SAFARI_019,
    x: 28,
    y: 13,
  },
  [INIT_POS.S019_RIGHT_0]: {
    location: MAP.SAFARI_019,
    x: 67,
    y: 20,
  },
  [INIT_POS.S019_RIGHT_1]: {
    location: MAP.SAFARI_019,
    x: 71,
    y: 37,
  },

  [INIT_POS.S020_DOWN_0]: {
    location: MAP.SAFARI_020,
    x: 8,
    y: 34,
  },
  [INIT_POS.S020_RIGHT_0]: {
    location: MAP.SAFARI_020,
    x: 40,
    y: 7,
  },

  [INIT_POS.S021_LEFT_0]: {
    location: MAP.SAFARI_021,
    x: 20,
    y: 21,
  },
  [INIT_POS.S021_UP_0]: {
    location: MAP.SAFARI_021,
    x: 35,
    y: 13,
  },
  [INIT_POS.S021_UP_1]: {
    location: MAP.SAFARI_021,
    x: 36,
    y: 13,
  },
  [INIT_POS.S021_DOWN_0]: {
    location: MAP.SAFARI_021,
    x: 56,
    y: 40,
  },
  [INIT_POS.S021_DOWN_1]: {
    location: MAP.SAFARI_021,
    x: 57,
    y: 40,
  },

  [INIT_POS.S022_UP_0]: {
    location: MAP.SAFARI_022,
    x: 23,
    y: 41,
  },
  [INIT_POS.S022_UP_1]: {
    location: MAP.SAFARI_022,
    x: 24,
    y: 41,
  },

  [INIT_POS.S023_UP_0]: {
    location: MAP.SAFARI_023,
    x: 21,
    y: 10,
  },
  [INIT_POS.S023_UP_1]: {
    location: MAP.SAFARI_023,
    x: 22,
    y: 10,
  },
  [INIT_POS.S023_RIGHT_0]: {
    location: MAP.SAFARI_023,
    x: 56,
    y: 13,
  },

  [INIT_POS.S024_LEFT_0]: {
    location: MAP.SAFARI_024,
    x: 2,
    y: 24,
  },
  [INIT_POS.S024_UP_0]: {
    location: MAP.SAFARI_024,
    x: 34,
    y: 3,
  },
  [INIT_POS.S024_RIGHT_0]: {
    location: MAP.SAFARI_024,
    x: 45,
    y: 17,
  },
  [INIT_POS.S025_DOWN_0]: {
    location: MAP.SAFARI_025,
    x: 40,
    y: 37,
  },
  [INIT_POS.S025_LEFT_0]: {
    location: MAP.SAFARI_025,
    x: 12,
    y: 19,
  },
  [INIT_POS.S025_UP_0]: {
    location: MAP.SAFARI_025,
    x: 18,
    y: 7,
  },
  [INIT_POS.S025_UP_1]: {
    location: MAP.SAFARI_025,
    x: 31,
    y: 16,
  },
  [INIT_POS.S026_RIGHT_0]: {
    location: MAP.SAFARI_026,
    x: 36,
    y: 16,
  },
  [INIT_POS.S027_DOWN_0]: {
    location: MAP.SAFARI_027,
    x: 9,
    y: 7,
  },
  [INIT_POS.S028_UP_0]: {
    location: MAP.SAFARI_028,
    x: 8,
    y: 4,
  },

  [INIT_POS.S029_LEFT_0]: {
    location: MAP.SAFARI_029,
    x: 7,
    y: 31,
  },
  [INIT_POS.S029_UP_0]: {
    location: MAP.SAFARI_029,
    x: 23,
    y: 11,
  },
  [INIT_POS.S029_DOWN_0]: {
    location: MAP.SAFARI_029,
    x: 31,
    y: 35,
  },

  [INIT_POS.S030_UP_0]: {
    location: MAP.SAFARI_030,
    x: 4,
    y: 4,
  },

  [INIT_POS.S031_UP_0]: {
    location: MAP.SAFARI_031,
    x: 29,
    y: 5,
  },

  [INIT_POS.S032_LEFT_0]: {
    location: MAP.SAFARI_032,
    x: 3,
    y: 8,
  },
  [INIT_POS.S032_RIGHT_0]: {
    location: MAP.SAFARI_032,
    x: 21,
    y: 11,
  },
  [INIT_POS.S032_DOWN_0]: {
    location: MAP.SAFARI_032,
    x: 14,
    y: 17,
  },

  [INIT_POS.S033_UP_0]: {
    location: MAP.SAFARI_033,
    x: 4,
    y: 4,
  },
  [INIT_POS.S033_DOWN_0]: {
    location: MAP.SAFARI_033,
    x: 27,
    y: 20,
  },
  [INIT_POS.S033_DOWN_1]: {
    location: MAP.SAFARI_033,
    x: 44,
    y: 27,
  },

  [INIT_POS.S034_LEFT_0]: {
    location: MAP.SAFARI_034,
    x: 8,
    y: 7,
  },
  [INIT_POS.S034_UP_0]: {
    location: MAP.SAFARI_034,
    x: 32,
    y: 6,
  },
  [INIT_POS.S034_RIGHT_0]: {
    location: MAP.SAFARI_034,
    x: 53,
    y: 6,
  },

  [INIT_POS.S035_LEFT_0]: {
    location: MAP.SAFARI_035,
    x: 4,
    y: 14,
  },
  [INIT_POS.S035_UP_0]: {
    location: MAP.SAFARI_035,
    x: 22,
    y: 8,
  },
  [INIT_POS.S035_DOWN_0]: {
    location: MAP.SAFARI_035,
    x: 26,
    y: 42,
  },
  [INIT_POS.S035_RIGHT_0]: {
    location: MAP.SAFARI_035,
    x: 44,
    y: 17,
  },

  [INIT_POS.S036_UP_0]: {
    location: MAP.SAFARI_036,
    x: 8,
    y: 4,
  },

  [INIT_POS.S037_UP_0]: {
    location: MAP.SAFARI_037,
    x: 28,
    y: 7,
  },

  [INIT_POS.S038_UP_0]: {
    location: MAP.SAFARI_038,
    x: 24,
    y: 4,
  },

  [INIT_POS.S039_LEFT_0]: {
    location: MAP.SAFARI_039,
    x: 15,
    y: 20,
  },
  [INIT_POS.S039_RIGHT_0]: {
    location: MAP.SAFARI_039,
    x: 57,
    y: 21,
  },
  [INIT_POS.S039_RIGHT_1]: {
    location: MAP.SAFARI_039,
    x: 57,
    y: 22,
  },
  [INIT_POS.S039_RIGHT_2]: {
    location: MAP.SAFARI_039,
    x: 57,
    y: 23,
  },
  [INIT_POS.S040_LEFT_0]: {
    location: MAP.SAFARI_040,
    x: 14,
    y: 12,
  },
  [INIT_POS.S040_LEFT_1]: {
    location: MAP.SAFARI_040,
    x: 14,
    y: 13,
  },
  [INIT_POS.S040_LEFT_2]: {
    location: MAP.SAFARI_040,
    x: 14,
    y: 14,
  },
  [INIT_POS.S040_UP_0]: {
    location: MAP.SAFARI_040,
    x: 47,
    y: 16,
  },
  [INIT_POS.S040_RIGHT_0]: {
    location: MAP.SAFARI_040,
    x: 55,
    y: 31,
  },

  [INIT_POS.S041_DOWN_0]: {
    location: MAP.SAFARI_041,
    x: 16,
    y: 37,
  },

  [INIT_POS.S042_LEFT_0]: {
    location: MAP.SAFARI_042,
    x: 7,
    y: 31,
  },
  [INIT_POS.S042_RIGHT_0]: {
    location: MAP.SAFARI_042,
    x: 51,
    y: 22,
  },

  [INIT_POS.S043_UP_0]: {
    location: MAP.SAFARI_043,
    x: 34,
    y: 7,
  },
  [INIT_POS.S043_LEFT_0]: {
    location: MAP.SAFARI_043,
    x: 11,
    y: 28,
  },
  [INIT_POS.S043_RIGHT_0]: {
    location: MAP.SAFARI_043,
    x: 56,
    y: 23,
  },

  [INIT_POS.S044_UP_0]: {
    location: MAP.SAFARI_044,
    x: 20,
    y: 5,
  },

  [INIT_POS.S045_LEFT_0]: {
    location: MAP.SAFARI_045,
    x: 7,
    y: 19,
  },

  [INIT_POS.S046_UP_0]: {
    location: MAP.SAFARI_046,
    x: 47,
    y: 10,
  },
  [INIT_POS.S046_UP_1]: {
    location: MAP.SAFARI_046,
    x: 48,
    y: 10,
  },
};
