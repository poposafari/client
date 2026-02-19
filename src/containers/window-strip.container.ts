import { GameScene } from '@poposafari/scenes';
import { TEXTURE } from '@poposafari/types';
import { addWindow } from '@poposafari/utils';

export type WindowStripOrientation = 'horizontal' | 'vertical';

export interface WindowStripOptions {
  orientation: WindowStripOrientation;
  slotCount: number;
  slotSize: number;
  spacing: number;
  framePadding?: number;
  texture?: TEXTURE;
  scale?: number;
  nineSlice?: { left: number; right: number; top: number; bottom: number };
}

const DEFAULT_FRAME_PADDING = 8;
const DEFAULT_SCALE = 2;
const DEFAULT_NINE_SLICE = { left: 16, right: 16, top: 16, bottom: 16 };

/**
 * 가로 또는 세로로 긴 프레임 윈도우 안에 작은 슬롯 윈도우들을 배치하는 컨테이너.
 * 컨테이너 origin은 스트립의 기하학적 중심에 두므로, setPosition(x, y) 시 스트립 중심이 (x, y)에 온다.
 */
export class WindowStripContainer extends Phaser.GameObjects.Container {
  scene: GameScene;
  private slotWindows: GWindow[] = [];
  private orientation!: WindowStripOrientation;
  private slotSize!: number;
  private spacing!: number;
  private stripCenter!: number;

  constructor(scene: GameScene) {
    super(scene, 0, 0);
    this.scene = scene;
    this.setScrollFactor(0);
    this.setVisible(true);
    scene.add.existing(this);
  }

  create(options: WindowStripOptions): void {
    const {
      orientation,
      slotCount,
      slotSize,
      spacing,
      framePadding = DEFAULT_FRAME_PADDING,
      texture = TEXTURE.WINDOW_HUD,
      scale = DEFAULT_SCALE,
      nineSlice = DEFAULT_NINE_SLICE,
    } = options;

    this.orientation = orientation;
    this.slotSize = slotSize;
    this.spacing = spacing;

    const totalContent = slotCount * slotSize + (slotCount - 1) * spacing;
    this.stripCenter = totalContent / 2 - slotSize / 2;

    const frameSize = totalContent + framePadding * 2;
    const slice = nineSlice;

    if (orientation === 'vertical') {
      const frameWidth = slotSize + framePadding * 2;
      const frameHeight = frameSize;
      const frame = addWindow(
        this.scene,
        texture,
        0,
        0,
        frameWidth,
        frameHeight,
        scale,
        slice.left,
        slice.right,
        slice.top,
        slice.bottom,
      );
      this.add(frame);

      for (let i = 0; i < slotCount; i++) {
        const y = i * (slotSize + spacing) - this.stripCenter;
        const win = addWindow(
          this.scene,
          texture,
          0,
          y,
          slotSize,
          slotSize,
          scale,
          slice.left,
          slice.right,
          slice.top,
          slice.bottom,
        );
        this.slotWindows.push(win);
        this.add(win);
      }
    } else {
      const frameWidth = frameSize;
      const frameHeight = slotSize + framePadding * 2;
      const frame = addWindow(
        this.scene,
        texture,
        0,
        0,
        frameWidth,
        frameHeight,
        scale,
        slice.left,
        slice.right,
        slice.top,
        slice.bottom,
      );
      this.add(frame);

      for (let i = 0; i < slotCount; i++) {
        const x = i * (slotSize + spacing) - this.stripCenter;
        const win = addWindow(
          this.scene,
          texture,
          x,
          0,
          slotSize,
          slotSize,
          scale,
          slice.left,
          slice.right,
          slice.top,
          slice.bottom,
        );
        this.slotWindows.push(win);
        this.add(win);
      }
    }
  }

  getSlotCount(): number {
    return this.slotWindows.length;
  }

  getSlotWindows(): GWindow[] {
    return this.slotWindows;
  }

  /** 슬롯 index의 중심 좌표 (컨테이너 로컬). 아이콘 등을 배치할 때 사용. */
  getSlotCenter(index: number): { x: number; y: number } {
    if (index < 0 || index >= this.slotWindows.length) return { x: 0, y: 0 };
    if (this.orientation === 'vertical') {
      const y = index * (this.slotSize + this.spacing) - this.stripCenter;
      return { x: 0, y };
    }
    const x = index * (this.slotSize + this.spacing) - this.stripCenter;
    return { x, y: 0 };
  }
}
