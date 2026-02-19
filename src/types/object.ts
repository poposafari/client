import { TEXTSHADOW, TEXTSTROKE, TEXTSTYLE } from './text';
import { TEXTURE } from './texture';

export interface GWindowForm {
  texture: TEXTURE;
  x: number;
  y: number;
  width: number;
  hegiht: number;
  leftWidth?: number;
  rightWidth?: number;
  topHeight?: number;
  bottomHeight?: number;
}

export interface GTextForm {
  x: number;
  y: number;
  content: string;
  fontSize: number;
  align: 'left' | 'center' | 'right';
  style: TEXTSTYLE;
  shadow: TEXTSHADOW;
  stroke?: TEXTSTROKE;
}

export interface ISelectOption {
  id: string;
  text: string;
}

/** 한 행 오른쪽에 가로로 여러 텍스트를 색별로 표시할 때 사용 (옵션 값 목록 등) */
export interface IValuePart {
  text: string;
  color?: string;
}

export interface IMenuItem {
  key: string;
  label: string;
  count?: string;
  /** 설정 시 count 대신 오른쪽에 가로로 여러 텍스트(색 구분) 표시 */
  valueParts?: IValuePart[];
  icon?: TEXTURE;
  color?: string;
}

export interface IMenuListConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  visibleCount: number;
  itemHeight: number;
  showCancel?: boolean;
}

export interface IMenuConfig {
  x: number;
  y: number;
  width?: number;
  itemHeight?: number;
}
