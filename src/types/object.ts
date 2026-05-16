import { SFX } from './audio';
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
  disabled?: boolean;
  registerIcon?: boolean;
  ownedIcon?: boolean;
}

export interface IMenuListConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  visibleCount: number;
  itemHeight: number;
  /** 슬롯 사이의 추가 y 간격(px). 미지정 시 0(=기존 동작 그대로). */
  itemGap?: number;
  showCancel?: boolean;
  borderPadding?: number;
  cursorSfx?: SFX;
  /** 지정 시 좌측 화살표 이미지 대신 해당 WINDOW 텍스처로 슬롯 전체를 감싸는 커서를 사용한다. */
  cursorWindowTexture?: TEXTURE;
  /** 활성화 시 라벨 좌측에 TEXTURE.OWNED 아이콘 슬롯을 예약하여 컬럼을 정렬한다(item.ownedIcon=true일 때 표시). */
  enableOwnedIcon?: boolean;
}

export interface IMenuConfig {
  x: number;
  y: number;
  width?: number;
  itemHeight?: number;
}
