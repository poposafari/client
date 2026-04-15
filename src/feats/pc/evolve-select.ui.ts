import { BaseUi, IInputHandler } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, KEY, SFX, TEXTCOLOR, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import {
  addContainer,
  addImage,
  addText,
  addWindow,
  getPokemonI18Name,
  getPokemonTexture,
  getTextStyle,
} from '@poposafari/utils';
import i18next from 'i18next';

export interface EvolveOption {
  cost: string;
  nextPokedexId: string;
  type1: string;
}

export type EvolveTimeOfDay = 'day' | 'night' | 'dawn' | 'dusk';

type ParsedCostPart = {
  labelText: string;
  iconKey: string;
  count: number | null;
  itemId: string | null;
  kind: 'item' | 'friendship' | 'time';
  friendshipRequired?: number;
  timePeriod?: EvolveTimeOfDay;
};

export interface EvolveContext {
  pokemonFriendship: number;
  currentTimeOfDay: EvolveTimeOfDay;
}

type EvolveItem =
  | { kind: 'option'; option: EvolveOption; parts: ParsedCostPart[]; affordable: boolean }
  | { kind: 'cancel' };

export function parseCostParts(cost: string, type1: string): ParsedCostPart[] {
  return cost.split('+').map((raw) => {
    const part = raw.trim();

    const candyMatch = part.match(/^candy_(\d+)$/);
    if (candyMatch) {
      return {
        labelText: i18next.t(`item:${type1}-candy.name`),
        iconKey: `${type1}-candy`,
        count: Number(candyMatch[1]),
        itemId: `${type1}-candy`,
        kind: 'item',
      };
    }

    const friendshipMatch = part.match(/^friendship_(\d+)$/);
    if (friendshipMatch) {
      const required = Number(friendshipMatch[1]);
      return {
        labelText: i18next.t('pc:friendship'),
        iconKey: 'soothe-bell',
        count: required,
        itemId: null,
        kind: 'friendship',
        friendshipRequired: required,
      };
    }

    const timeMatch = part.match(/^time_(day|night|dawn|dusk)$/);
    if (timeMatch) {
      const period = timeMatch[1] as EvolveTimeOfDay;
      const periodI18Key: Record<string, string> = {
        day: 'menu:timeDay',
        night: 'menu:timeNight',
        dawn: 'menu:timeDawn',
        dusk: 'menu:timeDusk',
      };
      return {
        labelText: i18next.t(periodI18Key[period]),
        iconKey: `icon_${period}`,
        count: null,
        itemId: null,
        kind: 'time',
        timePeriod: period,
      };
    }

    // 진화석 등 일반 아이템
    return {
      labelText: i18next.t(`item:${part}.name`),
      iconKey: part,
      count: 1,
      itemId: part,
      kind: 'item',
    };
  });
}

// menu-list-ui 와 동일한 레이아웃 규약
const FONT_SIZE = 80;
const SCROLL_BAR_WIDTH = 12;
const LAYOUT = {
  ITEM_HEIGHT_RATIO: 1.4,
  PADDING_RATIO: 2.5,
  SIDE_PADDING_RATIO: 0.8,
  CURSOR_GAP_RATIO: 0.6,
  MIN_AUTO_WIDTH_RATIO: 4,
  VISUAL_SCALE: 4,
  BORDER_PADDING: 40,
  SCROLL_OFFSET_X: 35,
  GAP: 16,
} as const;

const ICON_SCALE = 3;
const ICON_SIZE = 16 * ICON_SCALE; // 48px

export interface EvolveSelectConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  visibleCount: number;
  itemHeight: number;
}

const DEFAULT_CONFIG: EvolveSelectConfig = {
  x: +1620,
  y: +740,
  visibleCount: 6,
  itemHeight: 0,
};

export class EvolveSelectUi extends BaseUi implements IInputHandler {
  scene: GameScene;

  private config: EvolveSelectConfig;
  private metrics!: {
    itemHeight: number;
    paddingWidth: number;
    leftPadding: number;
    rightPadding: number;
    cursorGap: number;
    minAutoWidth: number;
  };
  private isAutoWidth = false;

  private items: EvolveItem[] = [];
  private cursorIndex = 0;
  private scrollIndex = 0;

  private window!: GWindow;
  private itemSlots: GContainer[] = [];
  private cursor!: GImage;
  private scrollBarContainer!: GContainer;
  private scrollThumbBg!: GWindow;
  private scrollThumb!: GWindow;

  private resolver: ((index: number | null) => void) | null = null;

  constructor(scene: GameScene, config: EvolveSelectConfig = DEFAULT_CONFIG) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE + 1);
    this.scene = scene;
    this.config = { ...config };

    this.initMetrics();
    this.initConfig();
    this.createLayout();
    this.setVisible(false);
  }

  private initMetrics(): void {
    this.metrics = {
      itemHeight: Math.floor(FONT_SIZE * LAYOUT.ITEM_HEIGHT_RATIO),
      paddingWidth: Math.floor(FONT_SIZE * LAYOUT.PADDING_RATIO),
      leftPadding: Math.floor(FONT_SIZE * LAYOUT.SIDE_PADDING_RATIO),
      rightPadding: Math.floor(FONT_SIZE * LAYOUT.SIDE_PADDING_RATIO),
      cursorGap: Math.floor(FONT_SIZE * LAYOUT.CURSOR_GAP_RATIO),
      minAutoWidth: Math.floor(FONT_SIZE * LAYOUT.MIN_AUTO_WIDTH_RATIO),
    };
  }

  private initConfig(): void {
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

  createLayout(): void {
    const { x, y, width, height, visibleCount, itemHeight } = this.config;
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

    const totalListHeight = visibleCount * itemHeight;
    const startY = -(totalListHeight / 2) + itemHeight / 2;
    for (let i = 0; i < visibleCount; i++) {
      const slot = addContainer(this.scene, 0, 0, startY + i * itemHeight);
      this.itemSlots.push(slot);
      this.add(slot);
    }

    const cursorScale = FONT_SIZE / 20;
    this.cursor = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, 0, 0).setScale(cursorScale);
    this.add(this.cursor);

    // 스크롤바
    this.scrollBarContainer = addContainer(this.scene, DEPTH.DEFAULT);
    this.scrollThumbBg = addWindow(
      this.scene,
      TEXTURE.SLIDER_BG,
      0,
      0,
      SCROLL_BAR_WIDTH,
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
      SCROLL_BAR_WIDTH,
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

    this.resizeLayout();
  }

  private resizeLayout(): void {
    const width = this.config.width!;
    const height = this.config.height!;

    this.window.setSize(width / LAYOUT.VISUAL_SCALE + 20, height / LAYOUT.VISUAL_SCALE);

    const halfWidth = width / 2;
    const labelX = -halfWidth + this.metrics.leftPadding;
    const cursorX = labelX - this.metrics.cursorGap;
    const scrollBarX = halfWidth - this.metrics.rightPadding / 2;

    this.cursor.setX(cursorX);
    this.scrollBarContainer.setX(scrollBarX + LAYOUT.SCROLL_OFFSET_X);

    const trackHeight = height / 2 - 20;
    const trackTopY = -height / 2 + 20;
    this.scrollThumbBg.setSize(SCROLL_BAR_WIDTH, trackHeight);
    this.scrollThumbBg.setPosition(0, trackTopY);
  }

  /** 한 행이 실제 그려낼 내부 컨텐츠 너비 (패딩 제외) */
  private measureContentWidth(item: EvolveItem, dummy: Phaser.GameObjects.Text): number {
    if (item.kind === 'cancel') {
      dummy.setText(i18next.t('menu:cancel'));
      return dummy.width;
    }

    let w = 0;
    const parts = item.parts;
    dummy.setText('(');
    const parenW = dummy.width;
    dummy.setText(')');
    const parenCloseW = dummy.width;
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        dummy.setText(' + ');
        w += dummy.width + LAYOUT.GAP;
      }
      dummy.setText(parts[i].labelText);
      w += dummy.width + LAYOUT.GAP;
      w += parenW + LAYOUT.GAP;
      w += ICON_SIZE + LAYOUT.GAP;
      w += parenCloseW + LAYOUT.GAP;
      if (parts[i].count !== null) {
        dummy.setText(`x${parts[i].count}`);
        w += dummy.width + LAYOUT.GAP;
      }
    }
    dummy.setText('→');
    w += 10 + dummy.width + 20;
    dummy.setText(getPokemonI18Name(item.option.nextPokedexId));
    w += dummy.width + LAYOUT.GAP;
    w += parenW + LAYOUT.GAP;
    w += ICON_SIZE + LAYOUT.GAP;
    w += parenCloseW;
    return w;
  }

  private calculateOptimalWidth(): number {
    const dummy = this.scene.make.text({
      style: getTextStyle(TEXTSTYLE.WHITE, FONT_SIZE, '100'),
    });
    let maxContent = 0;
    for (const item of this.items) {
      const w = this.measureContentWidth(item, dummy);
      if (w > maxContent) maxContent = w;
    }
    dummy.destroy();
    return Math.max(maxContent + this.metrics.paddingWidth, this.metrics.minAutoWidth);
  }

  open(options: EvolveOption[], context: EvolveContext): Promise<number | null> {
    const itemBag = this.scene.getUser()?.getItemBag() ?? null;
    const parsed: EvolveItem[] = options.map((option) => {
      const parts = parseCostParts(option.cost, option.type1);
      let affordable = true;
      for (const p of parts) {
        if (p.kind === 'item' && p.itemId !== null) {
          const required = p.count ?? 1;
          const owned = itemBag?.get(p.itemId)?.quantity ?? 0;
          if (owned < required) {
            affordable = false;
            break;
          }
        } else if (p.kind === 'friendship') {
          if (context.pokemonFriendship < (p.friendshipRequired ?? 0)) {
            affordable = false;
            break;
          }
        } else if (p.kind === 'time') {
          if (context.currentTimeOfDay !== p.timePeriod) {
            affordable = false;
            break;
          }
        }
      }
      return { kind: 'option', option, parts, affordable };
    });
    parsed.push({ kind: 'cancel' });
    this.items = parsed;

    if (this.isAutoWidth) {
      const optimal = this.calculateOptimalWidth();
      if (Math.abs(optimal - this.config.width!) > 1) {
        this.config.width = optimal;
        this.resizeLayout();
      }
    } else {
      this.resizeLayout();
    }

    this.clampToScreen();

    this.cursorIndex = 0;
    this.scrollIndex = 0;
    this.refreshList();
    this.show();
    this.setVisible(true);

    return new Promise<number | null>((resolve) => {
      this.resolver = resolve;
    });
  }

  override hide(): void {
    this.setVisible(false);
    super.hide();
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
      case KEY.ENTER: {
        const current = this.items[this.cursorIndex];
        if (current && current.kind === 'option' && !current.affordable) {
          this.scene.getAudio().playEffect(SFX.BUZZER);
          break;
        }
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.selectItem();
        break;
      }
      case KEY.X:
      case KEY.ESC:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.resolve(null);
        break;
    }
  }

  private moveCursor(delta: number): void {
    const n = this.items.length;
    if (n === 0) return;

    let next = this.cursorIndex + delta;
    const wrappedToTop = next >= n;
    const wrappedToBottom = next < 0;

    if (next < 0) next = n - 1;
    else if (next >= n) next = 0;
    this.cursorIndex = next;

    if (wrappedToTop) {
      this.scrollIndex = 0;
    } else if (wrappedToBottom) {
      this.scrollIndex = Math.max(0, n - this.config.visibleCount);
    } else {
      if (this.cursorIndex >= this.scrollIndex + this.config.visibleCount) {
        this.scrollIndex++;
      } else if (this.cursorIndex < this.scrollIndex) {
        this.scrollIndex--;
      }
    }
    this.refreshList();
  }

  private selectItem(): void {
    const item = this.items[this.cursorIndex];
    if (!item) return;
    if (item.kind === 'cancel') {
      this.resolve(null);
      return;
    }
    this.resolve(this.cursorIndex);
  }

  private refreshList(): void {
    const { visibleCount, itemHeight } = this.config;
    for (let i = 0; i < visibleCount; i++) {
      const dataIndex = this.scrollIndex + i;
      const slot = this.itemSlots[i];
      slot.removeAll(true);
      if (dataIndex >= this.items.length) {
        slot.setVisible(false);
        continue;
      }
      slot.setVisible(true);
      const isSelected = dataIndex === this.cursorIndex;
      this.buildRow(slot, this.items[dataIndex], isSelected);
    }

    const rel = this.cursorIndex - this.scrollIndex;
    const cursorY = this.itemSlots[0].y + rel * itemHeight;
    this.cursor.setY(cursorY);

    this.updateScrollBar();
  }

  private buildRow(slot: GContainer, item: EvolveItem, isSelected: boolean): void {
    const unaffordable = item.kind === 'option' && !item.affordable;
    const color = unaffordable
      ? TEXTCOLOR.LIGHT_GRAY
      : isSelected
        ? TEXTCOLOR.YELLOW
        : TEXTCOLOR.WHITE;
    const halfWidth = this.config.width! / 2;
    let x = -halfWidth + this.metrics.leftPadding;

    if (item.kind === 'cancel') {
      const t = addText(
        this.scene,
        x,
        0,
        i18next.t('menu:cancel'),
        FONT_SIZE,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ).setOrigin(0, 0.5);
      t.setColor(color);
      slot.add(t);
      return;
    }

    // 비용 파트
    for (let i = 0; i < item.parts.length; i++) {
      const part = item.parts[i];

      if (i > 0) {
        const sep = addText(
          this.scene,
          x,
          0,
          ' + ',
          FONT_SIZE,
          '100',
          'left',
          TEXTSTYLE.WHITE,
          TEXTSHADOW.GRAY,
        ).setOrigin(0, 0.5);
        sep.setColor(color);
        slot.add(sep);
        x += sep.width + LAYOUT.GAP;
      }

      const label = addText(
        this.scene,
        x,
        0,
        part.labelText,
        FONT_SIZE,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ).setOrigin(0, 0.5);
      label.setColor(color);
      slot.add(label);
      x += label.width + LAYOUT.GAP;

      const openParen = addText(
        this.scene,
        x,
        0,
        '(',
        FONT_SIZE,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ).setOrigin(0, 0.5);
      openParen.setColor(color);
      slot.add(openParen);
      x += openParen.width + LAYOUT.GAP;

      const icon = addImage(this.scene, part.iconKey, undefined, x + ICON_SIZE / 2, 0).setScale(
        ICON_SCALE,
      );
      icon.setOrigin(0.5, 0.5);
      slot.add(icon);
      x += ICON_SIZE + LAYOUT.GAP;

      const closeParen = addText(
        this.scene,
        x,
        0,
        ')',
        FONT_SIZE,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      ).setOrigin(0, 0.5);
      closeParen.setColor(color);
      slot.add(closeParen);
      x += closeParen.width + LAYOUT.GAP;

      if (part.count !== null) {
        const countText = addText(
          this.scene,
          x,
          0,
          `x${part.count}`,
          FONT_SIZE,
          '100',
          'left',
          TEXTSTYLE.WHITE,
          TEXTSHADOW.GRAY,
        ).setOrigin(0, 0.5);
        countText.setColor(color);
        slot.add(countText);
        x += countText.width + LAYOUT.GAP;
      }
    }

    // 화살표
    const arrow = addText(
      this.scene,
      x + 10,
      0,
      '→',
      FONT_SIZE,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);
    arrow.setColor(color);
    slot.add(arrow);
    x += arrow.width + 20;

    // 포켓몬 이름 (이름이 먼저)
    const name = addText(
      this.scene,
      x,
      0,
      getPokemonI18Name(item.option.nextPokedexId),
      FONT_SIZE,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);
    name.setColor(color);
    slot.add(name);
    x += name.width + LAYOUT.GAP;

    // 포켓몬 아이콘을 (...)로 감싼다
    const pOpen = addText(
      this.scene,
      x,
      0,
      '(',
      FONT_SIZE,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);
    pOpen.setColor(color);
    slot.add(pOpen);
    x += pOpen.width + LAYOUT.GAP;

    const tex = getPokemonTexture('icon', item.option.nextPokedexId);
    const pokemonIcon = this.scene.add
      .sprite(x + ICON_SIZE / 2, 0, tex.key, tex.frame + '_0')
      .setScale(1.6)
      .setOrigin(0.5, 0.5);
    slot.add(pokemonIcon);
    x += ICON_SIZE + LAYOUT.GAP;

    const pClose = addText(
      this.scene,
      x,
      0,
      ')',
      FONT_SIZE,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(0, 0.5);
    pClose.setColor(color);
    slot.add(pClose);
  }

  private updateScrollBar(): void {
    const totalItems = this.items.length;
    const visibleCount = this.config.visibleCount;

    if (totalItems <= visibleCount) {
      this.scrollThumb.setVisible(false);
      this.scrollThumbBg.setVisible(false);
      return;
    }
    this.scrollThumb.setVisible(true);
    this.scrollThumbBg.setVisible(true);

    const trackHeight = this.config.height! - LAYOUT.BORDER_PADDING;

    let thumbHeight = (visibleCount / totalItems) * trackHeight;
    const minThumbHeight = FONT_SIZE;
    thumbHeight = Math.max(thumbHeight, minThumbHeight);
    thumbHeight = Math.min(thumbHeight, trackHeight);

    const trackTopY = -(trackHeight / 2);
    const availableMoveSpace = trackHeight - thumbHeight;
    const maxScrollIndex = Math.max(1, totalItems - visibleCount);
    const scrollRatio = this.scrollIndex / maxScrollIndex;
    const currentY = trackTopY + availableMoveSpace * scrollRatio;

    this.scrollThumb.setPosition(0, currentY);
    this.scrollThumb.setSize(SCROLL_BAR_WIDTH, thumbHeight / 2);

    if (this.scrollThumb instanceof Phaser.GameObjects.Container) {
      (this.scrollThumb as Phaser.GameObjects.Container).list.forEach((child: any) => {
        if (child.setSize) {
          child.setSize(SCROLL_BAR_WIDTH, thumbHeight / 2);
        } else if (child.setDisplaySize) {
          child.setDisplaySize(SCROLL_BAR_WIDTH, thumbHeight / 2);
        }
      });
    }
  }

  private clampToScreen(): void {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;
    const width = this.config.width!;
    const height = this.config.height!;

    const scrollExtra = this.metrics.rightPadding / 2 + LAYOUT.SCROLL_OFFSET_X + SCROLL_BAR_WIDTH;
    const marginX = -35;
    const marginY = 5;

    const minX = width / 2 + marginX;
    const maxX = screenWidth - width / 2 - scrollExtra - marginX;
    const minY = height / 2 + marginY;
    const maxY = screenHeight - height / 2 - marginY;

    let nx = this.config.x;
    let ny = this.config.y;
    if (maxX >= minX) nx = Math.min(Math.max(nx, minX), maxX);
    else nx = screenWidth / 2;
    if (maxY >= minY) ny = Math.min(Math.max(ny, minY), maxY);
    else ny = screenHeight / 2;

    this.setPosition(nx, ny);
  }

  private resolve(index: number | null): void {
    this.hide();
    const r = this.resolver;
    this.resolver = null;
    r?.(index);
  }

  errorEffect(_errorMsg: string): void {}
  waitForInput(): Promise<unknown> {
    return new Promise(() => {});
  }
}
