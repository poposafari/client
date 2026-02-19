import { BaseUi, IInputHandler, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  IMenuItem,
  IMenuListConfig,
  KEY,
  SFX,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import { addContainer, addWindow, addText, addImage, getTextStyle } from '@poposafari/utils';
import i18next from 'i18next';

export class MenuListUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;
  private readonly FONT_SIZE = 80;
  private readonly SCROLL_BAR_WIDTH = 12;
  private readonly LAYOUT = {
    ITEM_HEIGHT_RATIO: 1.4,
    PADDING_RATIO: 2.5,
    SIDE_PADDING_RATIO: 0.8,
    CURSOR_GAP_RATIO: 0.6,
    MIN_AUTO_WIDTH_RATIO: 4,
    VISUAL_SCALE: 4,
    BORDER_PADDING: 40,
    SCROLL_OFFSET_X: 35,
    VALUE_PART_GAP: 16,
  } as const;

  protected config: IMenuListConfig;
  protected items: IMenuItem[] = [];

  private metrics!: {
    itemHeight: number;
    paddingWidth: number;
    leftPadding: number;
    rightPadding: number;
    cursorGap: number;
    minAutoWidth: number;
  };

  private isAutoWidth = false;

  protected cursorIndex = 0;
  protected scrollIndex = 0;

  protected window!: GWindow;
  protected itemSlots: GContainer[] = [];
  protected cursor!: GImage;
  protected scrollBarContainer!: GContainer;
  protected scrollThumb!: GWindow;
  protected scrollThumbBg!: GWindow;

  public onSelect?: (item: IMenuItem) => void;
  public onCancel?: () => void;
  public onCursorMove?: (index: number, item: IMenuItem) => void;
  protected resolveSelection: ((item: IMenuItem | null) => void) | null = null;

  constructor(scene: GameScene, inputManager: InputManager, config: IMenuListConfig) {
    super(scene, inputManager, DEPTH.DEFAULT);
    this.scene = scene;
    this.config = config;

    this.initMetrics();
    this.initConfig();
    this.createLayout();
  }

  private initMetrics() {
    this.metrics = {
      itemHeight: Math.floor(this.FONT_SIZE * this.LAYOUT.ITEM_HEIGHT_RATIO),
      paddingWidth: Math.floor(this.FONT_SIZE * this.LAYOUT.PADDING_RATIO),
      leftPadding: Math.floor(this.FONT_SIZE * this.LAYOUT.SIDE_PADDING_RATIO),
      rightPadding: Math.floor(this.FONT_SIZE * this.LAYOUT.SIDE_PADDING_RATIO),
      cursorGap: Math.floor(this.FONT_SIZE * this.LAYOUT.CURSOR_GAP_RATIO),
      minAutoWidth: Math.floor(this.FONT_SIZE * this.LAYOUT.MIN_AUTO_WIDTH_RATIO),
    };
  }

  private initConfig() {
    if (!this.config.itemHeight || this.config.itemHeight < this.metrics.itemHeight) {
      this.config.itemHeight = this.metrics.itemHeight;
    }

    const screenHeight = this.scene.scale.height;
    const maxPossibleCount = Math.floor(
      (screenHeight - this.metrics.itemHeight) / this.config.itemHeight,
    );
    if (this.config.visibleCount > maxPossibleCount) {
      this.config.visibleCount = maxPossibleCount;
    }

    if (!this.config.height) {
      this.config.height =
        this.config.itemHeight * this.config.visibleCount + this.metrics.itemHeight * 0.8;
    }

    if (!this.config.width) {
      this.isAutoWidth = true;
      this.config.width = this.metrics.minAutoWidth;
    } else {
      this.isAutoWidth = false;
    }
  }

  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  onInput(key: string): void {
    if (this.items.length === 0) return;
    if (this.handleNavigationInput(key)) return;
    this.handleCustomInput(key);
  }

  protected handleNavigationInput(key: string): boolean {
    switch (key) {
      case KEY.UP:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(-1);
        return true;
      case KEY.DOWN:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.moveCursor(1);
        return true;
      case KEY.Z:
      case KEY.ENTER:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.selectItem();
        return true;
      case KEY.X:
      case KEY.ESC:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.cancel();
        return true;
    }
    return false;
  }

  protected handleCustomInput(key: string): void {}

  createLayout() {
    const { x, y, width, height } = this.config;
    this.setPosition(x, y);

    this.window = addWindow(
      this.scene,
      this.scene.getOption().getWindow(),
      0,
      0,
      width!,
      height!,
      4,
      16,
      16,
      16,
      16,
    );
    this.add(this.window);

    this.createItemSlots();

    const cursorScale = this.FONT_SIZE / 20;
    this.cursor = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, 0, 0).setScale(cursorScale);
    this.add(this.cursor);

    this.createScrollBar();

    this.resizeLayout();
  }

  private createItemSlots() {
    const { visibleCount, itemHeight } = this.config;
    const totalListHeight = visibleCount * itemHeight;
    const startY = -(totalListHeight / 2) + itemHeight / 2;

    for (let i = 0; i < visibleCount; i++) {
      const slotContainer = addContainer(this.scene, 0, 0, startY + i * itemHeight);

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

      const countContainer = addContainer(this.scene, 0, 0, 0);
      slotContainer.add([label, countContainer]);
      this.itemSlots.push(slotContainer);
      this.add(slotContainer);
    }
  }

  protected createScrollBar() {
    this.scrollBarContainer = addContainer(this.scene, DEPTH.DEFAULT);

    this.scrollThumbBg = addWindow(
      this.scene,
      TEXTURE.SLIDER_BG,
      0,
      0,
      this.SCROLL_BAR_WIDTH,
      100,
      2,
      4,
      4,
      4,
      4,
    );
    this.scrollThumbBg.setOrigin(0.5, 0);

    this.scrollThumb = addWindow(
      this.scene,
      TEXTURE.SLIDER,
      0,
      0,
      this.SCROLL_BAR_WIDTH,
      30,
      2,
      4,
      4,
      4,
      4,
    );
    this.scrollThumb.setOrigin(0.5, 0);

    this.scrollBarContainer.add([this.scrollThumbBg, this.scrollThumb]);
    this.add(this.scrollBarContainer);
  }

  public setItems(items: IMenuItem[]) {
    this.items = [...items];

    if (this.config.showCancel) {
      this.items.push({ key: 'cancel', label: i18next.t('menu:cancel') });
    }

    if (this.isAutoWidth) {
      const optimalWidth = this.calculateOptimalWidth();
      if (Math.abs(optimalWidth - this.config.width!) > 1) {
        this.config.width = optimalWidth;
        this.resizeLayout();
      }
    } else {
      this.resizeLayout();
    }

    this.cursorIndex = 0;
    this.scrollIndex = 0;
    this.refreshList();
  }

  private calculateOptimalWidth(): number {
    let maxContentWidth = 0;
    const dummyText = this.scene.make.text({
      style: getTextStyle(TEXTSTYLE.WHITE, this.FONT_SIZE, '100'),
    });

    for (const item of this.items) {
      dummyText.setText(item.label);
      const labelW = dummyText.width;
      let countW = 0;
      if (item.valueParts && item.valueParts.length > 0) {
        for (const part of item.valueParts) {
          dummyText.setText(part.text);
          countW += dummyText.width;
        }
      } else if (item.count) {
        dummyText.setText(item.count);
        countW = dummyText.width;
      }

      const totalItemWidth = labelW + countW + this.FONT_SIZE * 0.5;
      if (totalItemWidth > maxContentWidth) {
        maxContentWidth = totalItemWidth;
      }
    }
    dummyText.destroy();
    return Math.max(maxContentWidth + this.metrics.paddingWidth, this.metrics.minAutoWidth);
  }

  private resizeLayout() {
    const width = this.config.width!;
    const height = this.config.height!;

    if (this.window && this.window.setSize) {
      this.window.setSize(width / this.LAYOUT.VISUAL_SCALE + 20, height / this.LAYOUT.VISUAL_SCALE);
    }

    const halfWidth = width / 2;
    const labelX = -halfWidth + this.metrics.leftPadding;
    const countX = halfWidth - this.metrics.rightPadding;
    const cursorX = labelX - this.metrics.cursorGap;
    const scrollBarX = halfWidth - this.metrics.rightPadding / 2;

    if (this.cursor) this.cursor.setX(cursorX);
    if (this.scrollBarContainer) {
      this.scrollBarContainer.setX(scrollBarX + this.LAYOUT.SCROLL_OFFSET_X);
    }

    if (this.scrollThumbBg) {
      const trackHeight = height / 2 - 20;
      const trackTopY = -height / 2 + 20;

      this.scrollThumbBg.setSize(this.SCROLL_BAR_WIDTH, trackHeight);
      this.scrollThumbBg.setPosition(0, trackTopY);
    }

    // 5. 슬롯 텍스트 위치 적용
    for (const slot of this.itemSlots) {
      const label = slot.list[0] as any;
      const countContainer = slot.list[1] as any;
      if (label) label.setX(labelX);
      if (countContainer) countContainer.setX(countX);
    }
  }

  /** 한 슬롯의 오른쪽(count) 영역을 item 기준으로 채움. 기존 Text 재사용하여 생성/파괴 최소화 */
  private fillCountArea(slot: GContainer, item: IMenuItem, labelColor: string): void {
    const countContainer = slot.list[1] as GContainer;
    const list = countContainer.list as Phaser.GameObjects.GameObject[];

    if (item.valueParts && item.valueParts.length > 0) {
      const parts = item.valueParts;
      const N = parts.length;
      while (list.length < N) {
        const t = addText(
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
        t.setOrigin(1, 0.5);
        countContainer.add(t);
      }
      while (list.length > N) {
        const child = list[list.length - 1];
        countContainer.remove(child);
        (child as Phaser.GameObjects.GameObject).destroy();
      }
      for (let i = 0; i < N; i++) {
        const text = list[i] as Phaser.GameObjects.Text;
        text.setText(parts[i].text);
        if (text.setColor) text.setColor(parts[i].color ?? TEXTCOLOR.WHITE);
      }
      let x = 0;
      for (let i = N - 1; i >= 0; i--) {
        const text = list[i] as Phaser.GameObjects.Text;
        text.setX(x);
        x -= text.width + this.LAYOUT.VALUE_PART_GAP;
      }
    } else {
      while (list.length > 1) {
        const child = list[list.length - 1];
        countContainer.remove(child);
        (child as Phaser.GameObjects.GameObject).destroy();
      }
      if (list.length === 0) {
        const t = addText(
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
        t.setOrigin(1, 0.5);
        countContainer.add(t);
      }
      const text = list[0] as Phaser.GameObjects.Text;
      text.setText(item.count || '');
      if (text.setColor) text.setColor(labelColor);
      text.setX(0);
    }
  }

  public updateItemCount(key: string, text: string) {
    const idx = this.items.findIndex((i) => i.key === key);
    if (idx === -1) return;
    this.items[idx].count = text;

    if (this.isAutoWidth) {
      const optimalWidth = this.calculateOptimalWidth();
      if (optimalWidth > this.config.width!) {
        this.config.width = optimalWidth;
        this.resizeLayout();
      }
    }
    this.refreshSingleSlot(idx);
  }

  protected moveCursor(delta: number) {
    if (this.items.length === 0) return;

    let nextIndex = this.cursorIndex + delta;
    const wrappedToTop = nextIndex >= this.items.length;
    const wrappedToBottom = nextIndex < 0;

    if (nextIndex < 0) nextIndex = this.items.length - 1;
    else if (nextIndex >= this.items.length) nextIndex = 0;

    this.cursorIndex = nextIndex;

    if (wrappedToTop) {
      this.scrollIndex = 0;
    } else if (wrappedToBottom) {
      this.scrollIndex = Math.max(0, this.items.length - this.config.visibleCount);
    } else {
      if (this.cursorIndex >= this.scrollIndex + this.config.visibleCount) {
        this.scrollIndex++;
      } else if (this.cursorIndex < this.scrollIndex) {
        this.scrollIndex--;
      }
    }

    this.refreshList();
    if (this.onCursorMove) this.onCursorMove(this.cursorIndex, this.items[this.cursorIndex]);
  }

  protected refreshList() {
    const { visibleCount, itemHeight } = this.config;

    for (let i = 0; i < visibleCount; i++) {
      const dataIndex = this.scrollIndex + i;
      const slot = this.itemSlots[i];
      const labelObj = slot.list[0] as any;

      if (dataIndex < this.items.length) {
        const item = this.items[dataIndex];
        slot.setVisible(true);
        if (labelObj.setText) labelObj.setText(item.label);

        const isSelected = dataIndex === this.cursorIndex;
        const labelColor = isSelected ? TEXTCOLOR.YELLOW : item.color || TEXTCOLOR.WHITE;
        if (labelObj.setColor) labelObj.setColor(labelColor);

        this.fillCountArea(slot, item, labelColor);
      } else {
        slot.setVisible(false);
      }
    }

    const relativeCursorIndex = this.cursorIndex - this.scrollIndex;
    const cursorY = this.itemSlots[0].y + relativeCursorIndex * itemHeight;
    this.cursor.setY(cursorY);

    this.updateScrollBar();
  }

  protected refreshSingleSlot(dataIndex: number) {
    if (dataIndex >= this.scrollIndex && dataIndex < this.scrollIndex + this.config.visibleCount) {
      const slotIndex = dataIndex - this.scrollIndex;
      const slot = this.itemSlots[slotIndex];
      const item = this.items[dataIndex];
      const isSelected = dataIndex === this.cursorIndex;
      const labelColor = isSelected ? TEXTCOLOR.ORANGE : item.color || TEXTCOLOR.WHITE;
      this.fillCountArea(slot, item, labelColor);
    }
  }

  protected updateScrollBar() {
    const totalItems = this.items.length;
    const visibleCount = this.config.visibleCount;

    if (totalItems <= visibleCount) {
      this.scrollThumb.setVisible(false);
      this.scrollThumbBg.setVisible(false);
      return;
    }
    this.scrollThumb.setVisible(true);
    this.scrollThumbBg.setVisible(true);

    const trackHeight = this.config.height! - this.LAYOUT.BORDER_PADDING;

    let thumbHeight = (visibleCount / totalItems) * trackHeight;
    const minThumbHeight = this.FONT_SIZE;
    thumbHeight = Math.max(thumbHeight, minThumbHeight);
    thumbHeight = Math.min(thumbHeight, trackHeight);

    const trackTopY = -(trackHeight / 2);
    const availableMoveSpace = trackHeight - thumbHeight;
    const maxScrollIndex = Math.max(1, totalItems - visibleCount);
    const scrollRatio = this.scrollIndex / maxScrollIndex;
    const currentY = trackTopY + availableMoveSpace * scrollRatio;

    this.scrollThumb.setPosition(0, currentY);

    this.scrollThumb.setSize(this.SCROLL_BAR_WIDTH, thumbHeight / 2);

    if (this.scrollThumb instanceof Phaser.GameObjects.Container) {
      this.scrollThumb.list.forEach((child: any) => {
        if (child.setSize) {
          child.setSize(this.SCROLL_BAR_WIDTH, thumbHeight / 2);
        } else if (child.setDisplaySize) {
          child.setDisplaySize(this.SCROLL_BAR_WIDTH, thumbHeight / 2);
        }
      });
    } else if ((this.scrollThumb as any).setSize) {
      (this.scrollThumb as any).setSize(this.SCROLL_BAR_WIDTH, thumbHeight / 2);
    }
  }

  protected selectItem() {
    const selected = this.items[this.cursorIndex];
    if (selected.key === 'cancel') this.cancel();
    else {
      if (this.onSelect) this.onSelect(selected);
      this.finish(selected);
    }
  }

  protected cancel() {
    if (this.onCancel) this.onCancel();
    this.finish(null);
  }

  protected finish(result: IMenuItem | null) {
    if (this.resolveSelection) {
      this.resolveSelection(result);
      this.resolveSelection = null;
    }
  }

  /** 옵션의 window 텍스처로 윈도우를 갱신 (언어/테마 변경 시 호출) */
  public updateWindow(): void {
    this.window.setTexture(this.scene.getOption().getWindow());
  }

  public waitForSelect(items?: IMenuItem[]): Promise<IMenuItem | null> {
    if (items) this.setItems(items);
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
