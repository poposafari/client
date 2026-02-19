import { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTROKE, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, addWindow } from '@poposafari/utils';

export interface ImageTextListRow {
  key: string;
  /** 해당 줄의 아이콘(이미지) 텍스처 (생략 시 defaultImageTexture 사용) */
  texture?: TEXTURE;
  /** 해당 줄의 텍스트 */
  text?: string;
  scale?: number;
}

export interface ImageTextListOptions {
  /** 감쌀 윈도우 텍스처 */
  windowTexture: TEXTURE;
  windowWidth: number;
  /** 윈도우 높이 (미지정 시 콘텐츠 기준으로 자동 계산: padding + rowHeight*행수 + rowGap*(행수-1)) */
  windowHeight?: number;
  windowScale?: number;
  nineSlice?: { left: number; right: number; top: number; bottom: number };
  /** 줄 식별 키 및 (선택) 행별 이미지/초기 텍스트. 순서대로 위에서 아래로 배치 */
  rows: ImageTextListRow[] | string[];
  /** 한 줄 높이 (미지정 시 windowHeight 있으면 그에 맞춤, 없으면 imageSize+8) */
  rowHeight?: number;
  /** 줄 사이 간격(세로) */
  rowGap?: number;
  /** 행 내 이미지 표시 크기(정사각) */
  imageSize?: number;
  /** 행별 이미지 미지정 시 사용할 기본 텍스처 */
  defaultImageTexture?: TEXTURE;
  /** 이미지와 텍스트 사이 간격 */
  gapBetweenImageAndText?: number;
  /** 윈도우 내부 여백 */
  padding?: number | { left: number; right: number; top: number; bottom: number };
  /** 텍스트 폰트 크기 */
  textFontSize?: number;
  textStyle?: TEXTSTYLE;
  textShadow?: TEXTSHADOW;
}

const DEFAULT_WINDOW_SCALE = 2;
const DEFAULT_NINE_SLICE = { left: 16, right: 16, top: 16, bottom: 16 };
const DEFAULT_IMAGE_SIZE = 28;
const DEFAULT_GAP = 8;
const DEFAULT_PADDING = 12;
const DEFAULT_TEXT_FONT_SIZE = 22;
const DEFAULT_ROW_GAP = 0;
/** windowHeight 미지정 시 rowHeight 기본값 (imageSize + 여유) */
const DEFAULT_ROW_HEIGHT_OFFSET = 8;

/**
 * 윈도우로 감싼 목록: 한 줄마다 GImage(왼쪽) + GText(오른쪽).
 * 각 줄은 키로 식별하며, 외부에서 getRow(key)로 image/text를 갱신할 수 있다.
 */
export class ImageTextListContainer extends Phaser.GameObjects.Container {
  scene: GameScene;
  private rows = new Map<string, { image: GImage; text: GText }>();
  private windowObj!: GWindow;

  constructor(scene: GameScene) {
    super(scene, 0, 0);
    this.scene = scene;
    this.setScrollFactor(0);
    this.setVisible(true);
    scene.add.existing(this);
  }

  create(options: ImageTextListOptions): void {
    const {
      windowTexture,
      windowWidth,
      windowHeight,
      windowScale = DEFAULT_WINDOW_SCALE,
      nineSlice = DEFAULT_NINE_SLICE,
      rows: rowDefs,
      rowHeight: rowHeightOption,
      imageSize = DEFAULT_IMAGE_SIZE,
      defaultImageTexture,
      gapBetweenImageAndText = DEFAULT_GAP,
      padding = DEFAULT_PADDING,
      textFontSize = DEFAULT_TEXT_FONT_SIZE,
      textStyle = TEXTSTYLE.WHITE,
      textShadow = TEXTSHADOW.GRAY,
    } = options;

    const pad =
      typeof padding === 'number'
        ? { left: padding, right: padding, top: padding, bottom: padding }
        : padding;

    /** 줄 사이 간격 (0을 구분하기 위해 undefined 여부로만 기본값 적용) */
    const rowGap = options.rowGap !== undefined ? options.rowGap : DEFAULT_ROW_GAP;

    const rowList: ImageTextListRow[] = rowDefs.map((r) =>
      typeof r === 'string' ? { key: r } : r,
    );
    const rowCount = rowList.length;
    const totalGaps = Math.max(0, rowCount - 1) * rowGap;

    let rowHeight: number;
    let resolvedWindowHeight: number;

    if (windowHeight != null) {
      const contentHeight = windowHeight - pad.top - pad.bottom;
      rowHeight =
        rowHeightOption ?? Math.floor((contentHeight - totalGaps) / Math.max(1, rowCount));
      resolvedWindowHeight = windowHeight;
    } else {
      rowHeight = rowHeightOption ?? imageSize + DEFAULT_ROW_HEIGHT_OFFSET;
      resolvedWindowHeight = pad.top + pad.bottom + rowCount * rowHeight + totalGaps;
    }

    this.windowObj = addWindow(
      this.scene,
      windowTexture,
      0,
      0,
      windowWidth,
      resolvedWindowHeight,
      windowScale,
      nineSlice.left,
      nineSlice.right,
      nineSlice.top,
      nineSlice.bottom,
    );
    this.windowObj.setOrigin(0, 0);
    this.add(this.windowObj);

    const fallbackTexture = defaultImageTexture ?? TEXTURE.ICON_CHECK;

    for (let i = 0; i < rowList.length; i++) {
      const def = rowList[i];
      const key = def.key;
      const tex = def.texture ?? fallbackTexture;
      const centerY = pad.top + i * (rowHeight + rowGap) + rowHeight / 2;
      const imageX = pad.left + imageSize / 2;
      const textX = pad.left + imageSize + gapBetweenImageAndText;

      const image = addImage(this.scene, tex, undefined, imageX, centerY);
      image.setDisplaySize(imageSize * (def.scale ?? 1), imageSize * (def.scale ?? 1));
      image.setOrigin(0.5, 0.5);

      const text = addText(
        this.scene,
        textX,
        centerY,
        def.text ?? '',
        textFontSize,
        '100',
        'left',
        textStyle,
        textShadow,
        TEXTSTROKE.GRAY,
      ).setOrigin(0, 0.5);

      this.rows.set(key, { image, text });
      this.add([image, text]);
    }
  }

  /** 줄 키로 해당 행의 image·text 참조 반환 (외부에서 setTexture, setText 등으로 갱신) */
  getRow(key: string): { image: GImage; text: GText } | undefined {
    return this.rows.get(key);
  }

  getWindow(): GWindow {
    return this.windowObj;
  }
}
