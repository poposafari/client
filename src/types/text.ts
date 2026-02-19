export type TextAlign = 'left' | 'center' | 'right';

export const enum TEXTCOLOR {
  WHITE = '#ffffff',
  REAL_BLACK = '#000000',
  BLACK = '#555555',
  GRAY = '#777777',
  LIGHT_GRAY = '#999999',
  SIG_0 = '#66cc40',
  SIG_1 = '#00a010',
  RED = '#dc0e0e',
  ORANGE = '#fe6244',
  YELLOW = '#f8ed62',
  DARK_YELLOW = '#dab600',
  RARE = '#60A5FA',
  EPIC = '#b973ff',
  LEGENDARY = '#FBBF24',
}

export const enum TEXTFONT {
  BW = 'bw_font',
}

export const enum TEXTSTYLE {
  WHITE,
  YELLOW,
  BLACK,
  SIG_0,
  SIG_1,
  SIG_2,
  ERROR,
  BLOCKING,
}

export const enum TEXTSHADOW {
  NONE,
  OBJ_NAME,
  GRAY,
  DARK_YELLOW,
  SIG_0,
  SIG_1,
  SIG_2,
  ERROR,
  BLOCKING,
}

export const enum TEXTSTROKE {
  NONE = 'none',
  GRAY = 'gray',
  OBJ_NAME = 'obj-name',
}

export interface BBCodeShadowConfig {
  offsetX: number;
  offsetY: number;
  color: string;
  blur: number;
  stroke: boolean;
  fill: boolean;
}
