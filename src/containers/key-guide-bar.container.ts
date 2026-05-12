import { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addText, addWindow } from '@poposafari/utils';

/**
 * 하나의 키 가이드 entry. 키 1개 또는 여러 개(separator로 연결)와 그 옆 설명 텍스트 묶음.
 * 예: { keys: ['방향키'], description: '이동' }
 *     { keys: ['Esc', 'X'], description: '그만두기' }   // [Esc] / [X] 그만두기
 */
export interface KeyGuideEntry {
  /** 키캡에 그릴 키 이름 목록 (caller가 직접 입력. 'Z', 'X', 'Esc', '방향키' 등) */
  keys: string[];
  /** 키캡 옆 설명 텍스트 (caller가 i18next.t(...) 결과를 그대로 전달) */
  description: string;
  /** keys[] 사이에 들어갈 구분자 텍스트 (기본 '/') */
  keySeparator?: string;
}

export interface KeyGuideBarOptions {
  /** 왼쪽에서 오른쪽으로 배치될 entry 목록 */
  entries: KeyGuideEntry[];

  /** 키캡 윈도우 텍스처 (기본 TEXTURE.KEYCAP) */
  keycapTexture?: TEXTURE;
  /** 키캡 윈도우 9-slice 스케일 (기본 3) */
  keycapScale?: number;
  /** 키캡 9-slice 슬라이스 (기본 {16,16,16,16}) */
  keycapNineSlice?: { left: number; right: number; top: number; bottom: number };
  /** 키캡 내부 텍스트 폰트 사이즈 (기본 32) */
  keycapTextSize?: number;
  /** 키캡 텍스트 좌우 패딩 (윈도우 폭 = text.displayWidth + paddingX, 기본 60) */
  keycapPaddingX?: number;
  /** 키캡 텍스트 상하 패딩 (윈도우 높이 = text.displayHeight + paddingY, 기본 70) */
  keycapPaddingY?: number;
  /** 키캡 텍스트의 y 오프셋 (키캡 3D 시각 보정용, 기본 -8) */
  keycapTextYOffset?: number;
  keycapTextStyle?: TEXTSTYLE;
  keycapTextShadow?: TEXTSHADOW;

  /** 설명 텍스트 폰트 사이즈 (기본 32) */
  descriptionTextSize?: number;
  descriptionTextStyle?: TEXTSTYLE;
  descriptionTextShadow?: TEXTSHADOW;

  /** keys[] 사이 separator 텍스트 폰트 사이즈 (기본 32) */
  separatorTextSize?: number;
  /** separator(`/`) 색 — 명시 안 하면 `descriptionTextStyle` 을 그대로 따라간다. */
  separatorTextStyle?: TEXTSTYLE;
  /** separator(`/`) 그림자 — 명시 안 하면 `descriptionTextShadow` 을 그대로 따라간다. */
  separatorTextShadow?: TEXTSHADOW;

  /** 같은 entry 안 키캡↔separator↔키캡 간격 (기본 12) */
  gapInsideEntry?: number;
  /** 마지막 키캡과 설명 텍스트 사이 간격 (기본 18) */
  gapKeyToDescription?: number;
  /** entry 사이 간격 (기본 60) */
  gapBetweenEntries?: number;
  /**
   * 바가 차지할 수 있는 최대 폭 (로컬 좌표). 콘텐츠 총 폭이 이 값을 넘으면
   * `setScale(maxWidth / totalWidth)` 로 컨테이너 전체가 축소된다.
   * 미지정 시 축소 없음(콘텐츠 그대로). 폭이 넉넉하면 확대는 하지 않는다.
   */
  maxWidth?: number;
  /**
   * 바의 정렬 기준 (기본 'left').
   * - 'left'  → 컨테이너 로컬 (0,0) = 바의 **좌측 시작점**. setPosition(x,y) → 좌측 끝이 (x,y).
   * - 'right' → 컨테이너 로컬 (0,0) = 바의 **우측 끝**.       setPosition(x,y) → 우측 끝이 (x,y).
   */
  align?: 'left' | 'right';
}

interface BuiltKeycap {
  window: GWindow;
  text: GText;
}

interface BuiltEntry {
  keycaps: BuiltKeycap[];
  separators: GText[];
  description: GText;
}

const DEFAULTS = {
  keycapTexture: TEXTURE.KEYCAP,
  keycapScale: 3,
  keycapNineSlice: { left: 16, right: 16, top: 16, bottom: 16 },
  keycapTextSize: 32,
  keycapPaddingX: 60,
  keycapPaddingY: 70,
  keycapTextYOffset: -8,
  keycapTextStyle: TEXTSTYLE.WHITE,
  keycapTextShadow: TEXTSHADOW.GRAY,
  descriptionTextSize: 32,
  descriptionTextStyle: TEXTSTYLE.WHITE,
  descriptionTextShadow: TEXTSHADOW.GRAY,
  separatorTextSize: 32,
  // separatorTextStyle/Shadow 의 기본값은 의도적으로 비워둠 — desc 색을 그대로 따라가게 한다.
  gapInsideEntry: 12,
  gapKeyToDescription: 18,
  gapBetweenEntries: 60,
  keySeparator: '/',
};

export class KeyGuideBarContainer extends Phaser.GameObjects.Container {
  scene: GameScene;
  private builtEntries: BuiltEntry[] = [];
  private totalWidth = 0;
  private totalHeight = 0;

  constructor(scene: GameScene) {
    super(scene, 0, 0);
    this.scene = scene;
    this.setScrollFactor(0);
    this.setVisible(true);
    scene.add.existing(this);
  }

  create(options: KeyGuideBarOptions): void {
    const opts = { ...DEFAULTS, ...options };
    let cursorX = 0;
    let maxHeight = 0;

    // separator 색·그림자는 명시 안 하면 desc 의 것을 따라간다 (옵션 → desc 순으로 fallback).
    const separatorStyle = options.separatorTextStyle ?? opts.descriptionTextStyle;
    const separatorShadow = options.separatorTextShadow ?? opts.descriptionTextShadow;

    for (let ei = 0; ei < opts.entries.length; ei++) {
      const entry = opts.entries[ei];
      const sep = entry.keySeparator ?? DEFAULTS.keySeparator;
      const built: BuiltEntry = {
        keycaps: [],
        separators: [],
        description: undefined as unknown as GText,
      };

      for (let ki = 0; ki < entry.keys.length; ki++) {
        const keyLabel = entry.keys[ki];

        const keyText = addText(
          this.scene,
          0,
          0,
          keyLabel,
          opts.keycapTextSize,
          '100',
          'center',
          opts.keycapTextStyle,
          opts.keycapTextShadow,
        );

        const keycapW = keyText.displayWidth + opts.keycapPaddingX;
        const keycapH = keyText.displayHeight + opts.keycapPaddingY;
        const keycapCenterX = cursorX + keycapW / 2;

        const window = addWindow(
          this.scene,
          opts.keycapTexture,
          keycapCenterX,
          0,
          keycapW,
          keycapH,
          opts.keycapScale,
          opts.keycapNineSlice.left,
          opts.keycapNineSlice.right,
          opts.keycapNineSlice.top,
          opts.keycapNineSlice.bottom,
        );

        keyText.setPosition(keycapCenterX, opts.keycapTextYOffset);

        this.add([window, keyText]);
        built.keycaps.push({ window, text: keyText });

        cursorX += keycapW;
        if (keycapH > maxHeight) maxHeight = keycapH;

        if (ki < entry.keys.length - 1) {
          cursorX += opts.gapInsideEntry;
          const sepText = addText(
            this.scene,
            0,
            0,
            sep,
            opts.separatorTextSize,
            '100',
            'center',
            separatorStyle,
            separatorShadow,
          );
          sepText.setPosition(cursorX + sepText.displayWidth / 2, 0);
          this.add(sepText);
          built.separators.push(sepText);
          cursorX += sepText.displayWidth + opts.gapInsideEntry;
        }
      }

      cursorX += opts.gapKeyToDescription;
      const descText = addText(
        this.scene,
        0,
        0,
        entry.description,
        opts.descriptionTextSize,
        '100',
        'left',
        opts.descriptionTextStyle,
        opts.descriptionTextShadow,
      );
      descText.setPosition(cursorX, 0);
      this.add(descText);
      built.description = descText;
      cursorX += descText.displayWidth;

      if (ei < opts.entries.length - 1) {
        cursorX += opts.gapBetweenEntries;
      }

      this.builtEntries.push(built);
    }

    this.totalWidth = cursorX;
    this.totalHeight = maxHeight;

    if (opts.maxWidth !== undefined && this.totalWidth > opts.maxWidth) {
      const fit = opts.maxWidth / this.totalWidth;
      this.setScale(fit);
    } else {
      this.setScale(1);
    }

    if (options.align === 'right') {
      for (const child of this.list) {
        (child as Phaser.GameObjects.GameObject & { x: number }).x -= this.totalWidth;
      }
    }
  }

  recreate(options: KeyGuideBarOptions): void {
    this.removeAll(true);
    this.builtEntries = [];
    this.totalWidth = 0;
    this.totalHeight = 0;
    this.create(options);
  }

  /** entry 개수 */
  getEntryCount(): number {
    return this.builtEntries.length;
  }

  /** 콘텐츠의 로컬(스케일 미적용) 폭 */
  getTotalWidth(): number {
    return this.totalWidth;
  }

  /** 실제 화면상 폭 (maxWidth 축소 반영, this.scaleX 곱) */
  getRenderedWidth(): number {
    return this.totalWidth * this.scaleX;
  }

  /** 바 전체 높이 (가장 큰 키캡 높이, 로컬) */
  getTotalHeight(): number {
    return this.totalHeight;
  }

  /** 설명 텍스트 GText 참조 (언어 변경 시 setText 호출용) */
  getEntryDescriptionText(entryIndex: number): GText | undefined {
    return this.builtEntries[entryIndex]?.description;
  }

  /** 키캡 안의 키 텍스트 GText 참조 */
  getEntryKeycapText(entryIndex: number, keyIndex: number): GText | undefined {
    return this.builtEntries[entryIndex]?.keycaps[keyIndex]?.text;
  }

  /** 설명 텍스트 갱신 (i18next 변경 후 호출). 폭이 변할 수 있으므로 필요 시 재배치 호출자 책임. */
  setEntryDescription(entryIndex: number, text: string): void {
    const entry = this.builtEntries[entryIndex];
    if (entry) entry.description.setText(text);
  }
}
