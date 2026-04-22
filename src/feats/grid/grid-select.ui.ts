import { BaseUi, IInputHandler, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, KEY, SFX } from '@poposafari/types';
import { addContainer, addImage, addSprite, addWindow } from '@poposafari/utils';

export interface IGridSelectItem {
  key: string;
  label: string;
  image: GImage;
  overlayImage?: GImage;
  overlayOffsetX?: number;
  overlayOffsetY?: number;
}

const DEFAULT_SLICE = 16;

const DEFAULT_CONFIRM_KEYS: string[] = [KEY.ENTER, KEY.Z];
const DEFAULT_CANCEL_KEYS: string[] = [KEY.ESC, KEY.X];
const DEFAULT_DIRECTION_KEYS = {
  up: KEY.UP,
  down: KEY.DOWN,
  left: KEY.LEFT,
  right: KEY.RIGHT,
} as const;

export type IGridSelectCursor =
  | { type: 'image'; texture: string; scale?: number; offsetX?: number; offsetY?: number }
  | { type: 'sprite'; texture: string; frame?: string; scale?: number; offsetX?: number; offsetY?: number }
  | { type: 'window'; texture: string; size?: number; scale?: number; offsetX?: number; offsetY?: number }
  | { type: 'both'; imageTexture: string; imageScale?: number; windowTexture: string; windowSize?: number; windowScale?: number; offsetX?: number; offsetY?: number };

export interface IGridSelectConfig {
  x: number;
  y: number;
  outerWindowTexture: string;
  innerWindowTexture: string;
  cursor: IGridSelectCursor;
  itemScale: number;
  items: IGridSelectItem[];
  columns: number;
  rows: number;
  rowGap: number;
  columnGap: number;
  innerCellWidth?: number;
  innerCellHeight?: number;
  innerWindowScale?: number;
  outerWindowScale?: number;
}

export class GridSelectUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  protected readonly config: IGridSelectConfig;
  protected cursorIndex = 0;
  private itemContainers: GContainer[] = [];
  private cellWidth = 0;
  private cellHeight = 0;
  private totalContentWidth = 0;
  private totalContentHeight = 0;
  protected cursor!: GImage | GSprite | GWindow;
  private cursorWindow!: GWindow | null;
  private innerWindowTemplate!: GWindow;
  private _itemsOverride: IGridSelectItem[] | null = null;

  onCursorMoved?: (selectedKey: string) => void;
  onConfirm?: () => void;
  onCancel?: () => void;

  constructor(scene: GameScene, inputManager: InputManager, config: IGridSelectConfig) {
    super(scene, inputManager, DEPTH.MESSAGE);
    this.config = config;
    this.createLayout();
  }

  protected getItems(): IGridSelectItem[] {
    return this._itemsOverride ?? this.config.items;
  }

  setItems(items: IGridSelectItem[]): void {
    this._itemsOverride = items;
    this.refreshItemCells();
  }

  private refreshItemCells(): void {
    for (const cell of this.itemContainers) {
      this.remove(cell);
      cell.destroy();
    }
    this.itemContainers = [];

    const items = this.getItems();
    const cols = this.config.columns;
    const gapH = this.config.rowGap;
    const gapW = this.config.columnGap;
    const itemScale = this.config.itemScale;
    const startX = -this.totalContentWidth / 2 + this.cellWidth / 2;
    const startY = -this.totalContentHeight / 2 + this.cellHeight / 2;

    for (let i = 0; i < items.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (this.cellWidth + gapW);
      const y = startY + row * (this.cellHeight + gapH);

      const cell = addContainer(this.scene, 0, 0, 0);
      const win = this.cloneInnerWindow(this.innerWindowTemplate);
      win.setPosition(x, y);
      cell.add(win);

      const img = items[i].image;
      img.setScale(itemScale);
      img.setPosition(x, y);
      cell.add(img);

      const overlay = items[i].overlayImage;
      if (overlay) {
        const ox = items[i].overlayOffsetX ?? 0;
        const oy = items[i].overlayOffsetY ?? 0;
        overlay.setPosition(x + ox, y + oy);
        cell.add(overlay);
      }

      this.addAt(cell, 1 + i);
      this.itemContainers.push(cell);
    }

    const count = items.length;
    if (this.cursorIndex >= count) this.cursorIndex = Math.max(0, count - 1);
    this.updateCursorPosition();
  }

  createLayout(): void {
    const items = this.getItems();
    const itemScale = this.config.itemScale;
    const cols = this.config.columns;
    const rows = this.config.rows;
    const gapH = this.config.rowGap;
    const gapW = this.config.columnGap;

    const cellW = this.config.innerCellWidth ?? 80;
    const cellH = this.config.innerCellHeight ?? 80;
    this.cellWidth = cellW;
    this.cellHeight = cellH;
    this.totalContentWidth = cols * this.cellWidth + Math.max(0, cols - 1) * gapW;
    this.totalContentHeight = rows * this.cellHeight + Math.max(0, rows - 1) * gapH;

    const innerScale = this.config.innerWindowScale ?? 3;
    const outerScale = this.config.outerWindowScale ?? 4;

    this.setPosition(this.config.x, this.config.y);

    const outerWindow = addWindow(
      this.scene,
      this.config.outerWindowTexture as never,
      0,
      0,
      this.totalContentWidth + 16,
      this.totalContentHeight + 16,
      outerScale,
      DEFAULT_SLICE,
      DEFAULT_SLICE,
      DEFAULT_SLICE,
      DEFAULT_SLICE,
    );
    outerWindow.setPosition(0, 0);
    this.add(outerWindow);

    this.innerWindowTemplate = addWindow(
      this.scene,
      this.config.innerWindowTexture as never,
      0,
      0,
      cellW,
      cellH,
      innerScale,
      DEFAULT_SLICE,
      DEFAULT_SLICE,
      DEFAULT_SLICE,
      DEFAULT_SLICE,
    );

    const startX = -this.totalContentWidth / 2 + this.cellWidth / 2;
    const startY = -this.totalContentHeight / 2 + this.cellHeight / 2;

    for (let i = 0; i < items.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (this.cellWidth + gapW);
      const y = startY + row * (this.cellHeight + gapH);

      const cell = addContainer(this.scene, 0, 0, 0);
      const win = this.cloneInnerWindow(this.innerWindowTemplate);
      win.setPosition(x, y);
      cell.add(win);

      const img = items[i].image;
      img.setScale(itemScale);
      img.setPosition(x, y);
      cell.add(img);

      const overlay = items[i].overlayImage;
      if (overlay) {
        const ox = items[i].overlayOffsetX ?? 0;
        const oy = items[i].overlayOffsetY ?? 0;
        overlay.setPosition(x + ox, y + oy);
        cell.add(overlay);
      }

      this.add(cell);
      this.itemContainers.push(cell);
    }

    const cur = this.config.cursor;
    this.cursorWindow = null;

    if (cur.type === 'window' || cur.type === 'both') {
      const texture = cur.type === 'both' ? cur.windowTexture : cur.texture;
      const size = cur.type === 'both' ? (cur.windowSize ?? 88) : (cur.size ?? 88);
      const scale = cur.type === 'both' ? (cur.windowScale ?? 2) : (cur.scale ?? 2);
      this.cursorWindow = addWindow(
        this.scene,
        texture as never,
        0,
        0,
        size,
        size,
        scale,
        DEFAULT_SLICE,
        DEFAULT_SLICE,
        DEFAULT_SLICE,
        DEFAULT_SLICE,
      );
      this.cursorWindow.setPosition(0, 0);
      this.add(this.cursorWindow);
    }

    if (cur.type === 'sprite') {
      const scale = cur.scale ?? 1.2;
      this.cursor = addSprite(this.scene, cur.texture as never, cur.frame, 0, 0).setScale(scale);
      this.cursor.setPosition(0, 0);
      this.add(this.cursor);
    } else if (cur.type === 'image' || cur.type === 'both') {
      const texture = cur.type === 'both' ? cur.imageTexture : cur.texture;
      const scale = cur.type === 'both' ? (cur.imageScale ?? 1.2) : (cur.scale ?? 1.2);
      this.cursor = addImage(this.scene, texture as never, undefined, 0, 0).setScale(scale);
      this.cursor.setPosition(0, 0);
      this.add(this.cursor);
    }

    if (cur.type === 'window') {
      this.cursor = this.cursorWindow as unknown as GImage;
    }

    this.updateCursorPosition();
  }

  private cloneInnerWindow(template: GWindow): GWindow {
    const w = template as Phaser.GameObjects.NineSlice;
    const key = w.texture?.key ?? '';
    const frame = w.frame?.name;
    const width = w.width;
    const height = w.height;
    const slice = w as unknown as {
      leftWidth?: number;
      rightWidth?: number;
      topHeight?: number;
      bottomHeight?: number;
    };
    const left = slice.leftWidth ?? 16;
    const right = slice.rightWidth ?? 16;
    const top = slice.topHeight ?? 16;
    const bottom = slice.bottomHeight ?? 16;
    const clone = this.scene.add.nineslice(
      0,
      0,
      key,
      frame,
      width,
      height,
      left,
      right,
      top,
      bottom,
    ) as GWindow;
    clone.setOrigin(0.5, 0.5);
    if (template.scaleX !== undefined) clone.setScale(template.scaleX);
    return clone;
  }

  protected updateCursorPosition(): void {
    const cols = this.config.columns;
    const gapH = this.config.rowGap;
    const gapW = this.config.columnGap;

    const startX = -this.totalContentWidth / 2 + this.cellWidth / 2;
    const startY = -this.totalContentHeight / 2 + this.cellHeight / 2;
    const row = Math.floor(this.cursorIndex / cols);
    const col = this.cursorIndex % cols;
    const x = startX + col * (this.cellWidth + gapW);
    const y = startY + row * (this.cellHeight + gapH);

    const ox = this.config.cursor.offsetX ?? 0;
    const oy = this.config.cursor.offsetY ?? 0;
    this.cursor.setPosition(x + ox, y + oy);
    this.cursorWindow?.setPosition(x + ox, y + oy);
  }

  getSelectedKey(): string {
    const items = this.getItems();
    const item = items[this.cursorIndex];
    return item?.key ?? '';
  }

  /** 현재 커서 위치의 아이템 인덱스(0-based). */
  getSelectedIndex(): number {
    return this.cursorIndex;
  }

  getSelectedItem(): IGridSelectItem | undefined {
    return this.getItems()[this.cursorIndex];
  }

  getItemByKey(key: string): IGridSelectItem | undefined {
    return this.getItems().find((i) => i.key === key);
  }

  protected getConfirmKeys(): string[] {
    return DEFAULT_CONFIRM_KEYS;
  }

  protected getCancelKeys(): string[] {
    return DEFAULT_CANCEL_KEYS;
  }

  protected getDirectionKeys(): { up: string; down: string; left: string; right: string } {
    return { ...DEFAULT_DIRECTION_KEYS };
  }

  protected handleConfirm(): void {
    this.onConfirm?.();
  }

  protected handleCancel(): void {
    this.onCancel?.();
  }

  protected handleDirectionInput(_key: string): boolean {
    return false;
  }

  onInput(key: string): void {
    const count = this.getItems().length;
    if (count === 0) return;

    if (this.getConfirmKeys().includes(key)) {
      (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
      this.handleConfirm();
      return;
    }
    if (this.getCancelKeys().includes(key)) {
      (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
      this.handleCancel();
      return;
    }

    if (this.handleDirectionInput(key)) return;

    const dir = this.getDirectionKeys();
    const cols = this.config.columns;
    let next = this.cursorIndex;
    if (key === dir.up) {
      next -= cols;
    } else if (key === dir.down) {
      next += cols;
    } else if (key === dir.left) {
      next -= 1;
    } else if (key === dir.right) {
      next += 1;
    } else {
      return;
    }

    if (next < 0) next = 0;
    if (next >= count) next = count - 1;
    this.cursorIndex = next;
    this.updateCursorPosition();

    (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
    const selectedKey = this.getSelectedKey();
    this.onCursorMoved?.(selectedKey);
    this.handleCursorMoved(selectedKey);
  }

  protected handleCursorMoved(_selectedKey: string): void {}

  setCursorVisible(visible: boolean): void {
    this.cursor?.setVisible(visible);
    this.cursorWindow?.setVisible(visible);
  }

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<unknown> {
    return new Promise(() => {});
  }

  onRefreshLanguage(): void {}
}
