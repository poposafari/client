import { BaseUi, IInputHandler, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  IMenuItem,
  KEY,
  SFX,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import { addContainer, addWindow, addText, addImage, getTextStyle } from '@poposafari/utils';
import i18next from 'i18next';

export interface IMenuConfig {
  x?: number;
  y: number;
  width?: number;
  itemHeight?: number;
  iconScale?: number;
}

export class MenuUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;

  private readonly FONT_SIZE = 80;
  private readonly LAYOUT = {
    ITEM_HEIGHT_RATIO: 1.4,
    PADDING_RATIO: 1,
    CURSOR_GAP_RATIO: 0.4,
    ICON_SIZE_RATIO: 0.9,
    ICON_LABEL_GAP_RATIO: 0.3,
    MIN_AUTO_WIDTH_RATIO: 4,
    VISUAL_SCALE: 4,
    BORDER_PADDING: 40,
    RIGHT_MARGIN: 20,
    LEFT_MARGIN: 20,
  } as const;

  protected config: IMenuConfig;
  protected items: IMenuItem[] = [];

  private metrics!: {
    itemHeight: number;
    paddingWidth: number;
    cursorGap: number;
    iconSize: number;
    iconLabelGap: number;
    minAutoWidth: number;
  };

  protected cursorIndex = 0;
  private lastSelectedIndex = 0;

  protected window!: GWindow;
  protected itemSlots: GContainer[] = [];
  protected cursor!: GImage;

  public onSelect?: (item: IMenuItem) => void;
  public onCancel?: () => void;
  public onCursorMove?: (index: number, item: IMenuItem) => void;
  protected resolveSelection: ((item: IMenuItem | null) => void) | null = null;

  constructor(scene: GameScene, inputManager: InputManager, config: IMenuConfig) {
    super(scene, inputManager, DEPTH.MESSAGE);
    this.scene = scene;
    this.config = config;

    this.initMetrics();

    if (!this.config.itemHeight) {
      this.config.itemHeight = this.metrics.itemHeight;
    }

    this.createLayout();
  }

  private initMetrics() {
    this.metrics = {
      itemHeight: Math.floor(this.FONT_SIZE * this.LAYOUT.ITEM_HEIGHT_RATIO),
      paddingWidth: Math.floor(this.FONT_SIZE * this.LAYOUT.PADDING_RATIO),
      cursorGap: Math.floor(this.FONT_SIZE * this.LAYOUT.CURSOR_GAP_RATIO),
      iconSize: Math.floor(this.FONT_SIZE * this.LAYOUT.ICON_SIZE_RATIO),
      iconLabelGap: Math.floor(this.FONT_SIZE * this.LAYOUT.ICON_LABEL_GAP_RATIO),
      minAutoWidth: Math.floor(this.FONT_SIZE * this.LAYOUT.MIN_AUTO_WIDTH_RATIO),
    };
  }

  onInput(key: string): void {
    if (this.items.length === 0) return;

    switch (key) {
      case KEY.UP:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(-1);
        break;
      case KEY.DOWN:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(1);
        break;
      case KEY.Z:
      case KEY.ENTER:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.selectItem();
        break;
      case KEY.X:
      case KEY.ESC:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.cancel();
        break;
    }
  }

  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  createLayout() {
    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      100,
      100,
      4,
      16,
      16,
      16,
      16,
    );
    this.add(this.window);

    const cursorScale = this.FONT_SIZE / 30;
    this.cursor = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, 0, 0).setScale(cursorScale);
    this.add(this.cursor);
  }

  public setItems(items: IMenuItem[]) {
    this.items = [...items];
    this.cursorIndex = 0;

    this.itemSlots.forEach((slot) => slot.destroy());
    this.itemSlots = [];

    this.createItemSlots();

    this.updateLayout();

    this.refreshList();
  }

  private createItemSlots() {
    const iconScale = this.config.iconScale ?? this.metrics.iconSize / 30;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const slotContainer = addContainer(this.scene, 0, 0);

      const label = addText(
        this.scene,
        0,
        0,
        '',
        this.FONT_SIZE,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      );
      label.setOrigin(0, 0.5);

      const count = addText(
        this.scene,
        0,
        0,
        '',
        this.FONT_SIZE,
        '100',
        'right',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      );
      count.setOrigin(1, 0.5);

      if (item.icon != null) {
        const icon = addImage(this.scene, item.icon, undefined, 0, 0)
          .setOrigin(0, 0.5)
          .setScale(iconScale);
        slotContainer.add([icon, label, count]);
      } else {
        slotContainer.add([label, count]);
      }
      this.itemSlots.push(slotContainer);
      this.add(slotContainer);
    }
  }

  private updateLayout() {
    const contentWidth = this.calculateOptimalWidth();
    const maxWidth = this.scene.scale.width - this.LAYOUT.RIGHT_MARGIN * 2;
    const finalWidth = Math.min(contentWidth, maxWidth);

    const totalHeight = this.items.length * this.config.itemHeight! + this.LAYOUT.BORDER_PADDING;

    if (this.window && this.window.setSize) {
      this.window.setSize(
        finalWidth / this.LAYOUT.VISUAL_SCALE + 7,
        totalHeight / this.LAYOUT.VISUAL_SCALE + 18,
      );
    }

    let targetX: number;
    if (this.config.x !== undefined) {
      targetX = this.config.x;
    } else {
      targetX = this.scene.scale.width - finalWidth / 2 - this.LAYOUT.RIGHT_MARGIN;
      const leftEdge = targetX - finalWidth / 2;
      if (leftEdge < this.LAYOUT.LEFT_MARGIN) {
        targetX = this.LAYOUT.LEFT_MARGIN + finalWidth / 2;
      }
    }

    let targetY = this.config.y - totalHeight / 2 - 35;

    if (targetY - totalHeight / 2 < 0) {
      targetY = totalHeight / 2 + this.LAYOUT.RIGHT_MARGIN;
    }

    this.setPosition(targetX, targetY);

    const startY =
      -(totalHeight / 2) + this.LAYOUT.BORDER_PADDING / 2 + this.config.itemHeight! / 2;

    const halfWidth = finalWidth / 2;
    const contentLeft = -halfWidth + this.metrics.paddingWidth;
    const labelXWithIcon = contentLeft + this.metrics.iconSize + this.metrics.iconLabelGap;
    const countX = halfWidth - this.metrics.paddingWidth;

    this.itemSlots.forEach((slot, index) => {
      slot.setY(startY + index * this.config.itemHeight!);

      const hasIcon = slot.list.length === 3;
      const label = (hasIcon ? slot.list[1] : slot.list[0]) as any;
      const count = (hasIcon ? slot.list[2] : slot.list[1]) as any;
      const labelX = hasIcon ? labelXWithIcon : contentLeft;

      if (hasIcon) (slot.list[0] as any).setX(contentLeft);
      if (label) label.setX(labelX);
      if (count) count.setX(countX);
    });

    this.cursor.setX(contentLeft - this.metrics.cursorGap);
  }

  private calculateOptimalWidth(): number {
    let maxContentWidth = 0;
    const dummyText = this.scene.make.text({
      style: getTextStyle(TEXTSTYLE.WHITE, this.FONT_SIZE, '100'),
    });

    const iconAreaWidth = this.metrics.iconSize + this.metrics.iconLabelGap;

    for (const item of this.items) {
      dummyText.setText(item.label);
      const labelW = dummyText.width;
      let countW = 0;
      if (item.count) {
        dummyText.setText(item.count);
        countW = dummyText.width;
      }
      const iconArea = item.icon != null ? iconAreaWidth : 0;
      const totalItemWidth = iconArea + labelW + countW + this.FONT_SIZE * 2;
      if (totalItemWidth > maxContentWidth) {
        maxContentWidth = totalItemWidth;
      }
    }
    dummyText.destroy();
    return Math.max(maxContentWidth, this.metrics.minAutoWidth);
  }

  protected refreshList() {
    this.items.forEach((item, index) => {
      const slot = this.itemSlots[index];
      const hasIcon = slot.list.length === 3;
      const labelObj = (hasIcon ? slot.list[1] : slot.list[0]) as any;
      const countObj = (hasIcon ? slot.list[2] : slot.list[1]) as any;

      if (hasIcon && item.icon != null) {
        const iconObj = slot.list[0] as any;
        if (iconObj.setTexture) iconObj.setTexture(item.icon);
      }

      if (labelObj.setText) labelObj.setText(item.label);
      if (countObj.setText) countObj.setText(item.count || '');

      const isSelected = index === this.cursorIndex;
      const color = isSelected ? TEXTCOLOR.YELLOW : item.color || TEXTCOLOR.WHITE;

      if (labelObj.setColor) labelObj.setColor(color);
      if (countObj.setColor) countObj.setColor(color);
    });

    if (this.itemSlots[this.cursorIndex]) {
      this.cursor.setY(this.itemSlots[this.cursorIndex].y);
    }
  }

  protected moveCursor(delta: number) {
    if (this.items.length === 0) return;

    let nextIndex = this.cursorIndex + delta;
    if (nextIndex < 0) nextIndex = this.items.length - 1;
    else if (nextIndex >= this.items.length) nextIndex = 0;

    this.cursorIndex = nextIndex;
    this.refreshList();

    if (this.onCursorMove) this.onCursorMove(this.cursorIndex, this.items[this.cursorIndex]);
  }

  protected selectItem() {
    const selected = this.items[this.cursorIndex];
    if (this.onSelect) this.onSelect(selected);
    this.finish(selected);
  }

  protected cancel() {
    if (this.onCancel) this.onCancel();
    this.finish(null);
  }

  protected finish(result: IMenuItem | null) {
    this.lastSelectedIndex = this.cursorIndex;
    if (this.resolveSelection) {
      this.resolveSelection(result);
      this.resolveSelection = null;
    }
  }

  public getLastSelectedIndex(): number {
    return this.lastSelectedIndex;
  }

  public updateWindow(): void {
    this.window.setTexture(this.scene.getOption().getWindow());
  }

  public waitForSelect(
    items?: IMenuItem[],
    options?: { initialCursorIndex?: number },
  ): Promise<IMenuItem | null> {
    if (items) {
      this.setItems(items);
      if (options?.initialCursorIndex !== undefined) {
        this.cursorIndex = Math.max(0, Math.min(items.length - 1, options.initialCursorIndex));
        this.refreshList();
      }
    }
    this.show();
    return new Promise((resolve) => {
      this.resolveSelection = resolve;
    });
  }

  onRefreshLanguage(): void {
    this.items.forEach((item) => {
      item.label = i18next.t(item.key);
    });
  }
}
