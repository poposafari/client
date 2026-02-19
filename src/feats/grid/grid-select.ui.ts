import { BaseUi, IInputHandler, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, KEY, SFX } from '@poposafari/types';
import { addContainer, addImage, addWindow } from '@poposafari/utils';

export interface IGridSelectItem {
  key: string;
  label: string;
  image: GImage;
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

export interface IGridSelectConfig {
  x: number;
  y: number;
  /** TEXTURE (or texture key). Grid creates outer window from this. */
  outerWindowTexture: string;
  /** TEXTURE for each cell frame. Grid creates inner window from this. */
  innerWindowTexture: string;
  /** TEXTURE for cursor image. */
  cursorTexture: string;
  /** TEXTURE for cursor highlight window. */
  cursorWindowTexture: string;
  itemScale: number;
  items: IGridSelectItem[];
  columns: number;
  rows: number;
  rowGap: number;
  columnGap: number;
  /** Inner cell size (default 80). */
  innerCellWidth?: number;
  innerCellHeight?: number;
  innerWindowScale?: number;
  outerWindowScale?: number;
  cursorScale?: number;
  cursorWindowSize?: number;
  cursorWindowScale?: number;
}

export class GridSelectUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  protected readonly config: IGridSelectConfig;
  protected cursorIndex = 0;
  private itemContainers: GContainer[] = [];
  private cellWidth = 0;
  private cellHeight = 0;
  private totalContentWidth = 0;
  private totalContentHeight = 0;
  private cursor!: GImage;
  private cursorWindow!: GWindow;
  private innerWindowTemplate!: GWindow;
  /** 데이터 교체 시 사용. null이면 config.items 사용. */
  private _itemsOverride: IGridSelectItem[] | null = null;

  /** Called when cursor moves (direction key). Parent sets to run behavior in their code. */
  onCursorMoved?: (selectedKey: string) => void;
  /** Called when user confirms (Enter/Z). Parent sets to resolve and hide. */
  onConfirm?: () => void;
  /** Called when user cancels (Esc/X). Parent sets to resolve with null and hide. */
  onCancel?: () => void;

  constructor(scene: GameScene, inputManager: InputManager, config: IGridSelectConfig) {
    super(scene, inputManager, DEPTH.MESSAGE);
    this.config = config;
    this.createLayout();
  }

  /** 현재 표시할 아이템 목록 (setItems로 교체 시 반영). */
  protected getItems(): IGridSelectItem[] {
    return this._itemsOverride ?? this.config.items;
  }

  /** 아이템 목록을 바꾸고 셀만 다시 그린다. 중간에 데이터가 바뀔 때 호출. */
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

      this.add(cell);
      this.itemContainers.push(cell);
    }

    const cwSize = this.config.cursorWindowSize ?? 88;
    const cwScale = this.config.cursorWindowScale ?? 2;
    this.cursorWindow = addWindow(
      this.scene,
      this.config.cursorWindowTexture as never,
      0,
      0,
      cwSize,
      cwSize,
      cwScale,
      DEFAULT_SLICE,
      DEFAULT_SLICE,
      DEFAULT_SLICE,
      DEFAULT_SLICE,
    );
    this.cursor = addImage(
      this.scene,
      this.config.cursorTexture as never,
      undefined,
      0,
      0,
    ).setScale(this.config.cursorScale ?? 1.2);

    this.cursorWindow.setPosition(0, 0);
    this.cursor.setPosition(0, 0);
    this.add(this.cursorWindow);
    this.add(this.cursor);

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

  private updateCursorPosition(): void {
    const cols = this.config.columns;
    const gapH = this.config.rowGap;
    const gapW = this.config.columnGap;

    const startX = -this.totalContentWidth / 2 + this.cellWidth / 2;
    const startY = -this.totalContentHeight / 2 + this.cellHeight / 2;
    const row = Math.floor(this.cursorIndex / cols);
    const col = this.cursorIndex % cols;
    const x = startX + col * (this.cellWidth + gapW);
    const y = startY + row * (this.cellHeight + gapH);

    this.cursor.setPosition(x, y);
    this.cursorWindow.setPosition(x, y);
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

  /** 키로 아이템 찾기 (커서가 벗어난 아이템의 스프라이트 등 접근용). */
  getItemByKey(key: string): IGridSelectItem | undefined {
    return this.getItems().find((i) => i.key === key);
  }

  /** Override to change which keys trigger confirm. Default: Enter, Z. */
  protected getConfirmKeys(): string[] {
    return DEFAULT_CONFIRM_KEYS;
  }

  /** Override to change which keys trigger cancel. Default: Esc, X. Return [] to disable. */
  protected getCancelKeys(): string[] {
    return DEFAULT_CANCEL_KEYS;
  }

  /** Override to change direction key bindings. */
  protected getDirectionKeys(): { up: string; down: string; left: string; right: string } {
    return { ...DEFAULT_DIRECTION_KEYS };
  }

  /** Override to define confirm action. Default: calls onConfirm?.() */
  protected handleConfirm(): void {
    this.onConfirm?.();
  }

  /** Override to define cancel action. Default: calls onCancel?.() */
  protected handleCancel(): void {
    this.onCancel?.();
  }

  /** Override to handle direction key entirely. Return true to consume key (no default cursor move). */
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

  /** Override in child to react to cursor movement. */
  protected handleCursorMoved(_selectedKey: string): void {}

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<unknown> {
    return new Promise(() => {});
  }

  onRefreshLanguage(): void {}
}
