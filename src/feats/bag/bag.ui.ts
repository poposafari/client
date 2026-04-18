import { BaseUi, IInputHandler, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  IMenuItem,
  ItemCategory,
  KEY,
  SFX,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import { addContainer, addImage, addText, addWindow } from '@poposafari/utils';
import i18next from '@poposafari/i18n';
import { ItemDetailContainer } from '@poposafari/containers/item-detail.container';
import { MenuListUi } from '../menu/menu-list.ui';
import { BAG_CATEGORIES } from './bag.constants';

export interface BagEntry {
  itemId: string;
  quantity: number;
  register: boolean;
}

export interface BagSelection {
  category: ItemCategory;
  entry: BagEntry;
}

export class BagUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;

  private readonly FONT_SIZE = 70;

  private background!: GImage;

  private headerText!: GText;

  private pocket!: GImage;

  private detail!: ItemDetailContainer;

  private menuList!: MenuListUi;

  private categoryIndex = 0;
  private entriesByCategory: Record<ItemCategory, BagEntry[]> = {
    pokeball: [],
    candy: [],
    etc: [],
    tms_hms: [],
    key: [],
  };

  private resolveSelection: ((result: BagSelection | null) => void) | null = null;

  private registerLookup: (itemId: string) => boolean = () => false;

  constructor(scene: GameScene, inputManager: InputManager) {
    super(scene, inputManager, DEPTH.MESSAGE);
    this.scene = scene;
    this.createLayout();
  }

  createLayout(): void {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;

    this.background = addImage(this.scene, TEXTURE.BG_BAG_M, undefined, 0, 0);
    this.background.setDisplaySize(screenWidth, screenHeight);
    this.add(this.background);

    this.headerText = addText(
      this.scene,
      -505,
      -450,
      '',
      80,
      '100',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.headerText.setOrigin(0.5, 0.5);
    this.add(this.headerText);

    this.pocket = addImage(
      this.scene,
      `pocket_${BAG_CATEGORIES[0]}`,
      undefined,
      -510,
      -160,
    ).setScale(3.2);
    this.add(this.pocket);

    this.detail = new ItemDetailContainer(this.scene, {
      icon: {
        x: -790,
        y: +135,
        scale: 5,
      },
      name: {
        x: 0,
        y: 0,
        fontSize: this.FONT_SIZE,
        style: TEXTSTYLE.WHITE,
        shadow: TEXTSHADOW.GRAY,
        visible: false,
      },
      desc: {
        x: -890,
        y: +270,
        fontSize: 85,
        style: TEXTSTYLE.BLACK,
        shadow: TEXTSHADOW.GRAY,
        visible: true,
      },
    });
    this.add(this.detail);

    const listWidth = 700;
    const listVisibleCount = 6;
    const listX = screenWidth / 2 - listWidth / 2 - 40 - screenWidth / 2;
    this.menuList = new MenuListUi(this.scene, this.inputManager, {
      x: +1370,
      y: +380,
      width: 960,
      visibleCount: listVisibleCount,
      itemHeight: 100,
      showCancel: true,
    });
    this.menuList.setWindowVisible(false);
    this.menuList.setCursorTexture(TEXTURE.CURSOR_BLACK);
    this.menuList.setCursorScale(3);
    this.menuList.setHighlightColor(null);
    this.menuList.setDefaultColor(TEXTCOLOR.BLACK);
    this.menuList.onCursorMove = (_i, item) => this.updateDetail(item.key);
    this.menuList.onSelect = (item) => this.handleSelect(item);
    this.menuList.onCancel = () => this.handleCancel();
    void listX;
  }

  onInput(key: string): void {
    switch (key) {
      case KEY.LEFT:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.shiftCategory(-1);
        return;
      case KEY.RIGHT:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.shiftCategory(1);
        return;
    }
    this.menuList.onInput(key);
  }

  errorEffect(_errorMsg: string): void {}
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  setRegisterLookup(lookup: (itemId: string) => boolean): void {
    this.registerLookup = lookup;
  }

  setBagData(entries: BagEntry[], masterLookup: (itemId: string) => ItemCategory | null): void {
    this.entriesByCategory = {
      pokeball: [],
      candy: [],
      etc: [],
      tms_hms: [],
      key: [],
    };
    for (const e of entries) {
      const cat = masterLookup(e.itemId);
      if (!cat) continue;
      this.entriesByCategory[cat].push(e);
    }
    if (this.visible) this.renderCurrentCategory();
  }

  showBag(initialCategoryIndex = 0): Promise<BagSelection | null> {
    if (!this.visible) {
      this.categoryIndex = initialCategoryIndex;
      this.renderCurrentCategory();
      this.menuList.show();
      this.show();
    }
    return new Promise((resolve) => {
      this.resolveSelection = resolve;
    });
  }

  hide(): void {
    super.hide();
    this.menuList.hide();
  }

  private currentCategory(): ItemCategory {
    return BAG_CATEGORIES[this.categoryIndex];
  }

  private shiftCategory(delta: number): void {
    const len = BAG_CATEGORIES.length;
    this.categoryIndex = (this.categoryIndex + delta + len) % len;
    this.renderCurrentCategory();
  }

  private renderCurrentCategory(): void {
    const cat = this.currentCategory();
    this.headerText.setText(i18next.t(`bag:category.${cat}`));
    this.pocket.setTexture(`pocket_${cat}`);

    const entries = this.entriesByCategory[cat];
    const items: IMenuItem[] = entries.map((e) => ({
      key: e.itemId,
      label: i18next.exists(`item:${e.itemId}.name`)
        ? i18next.t(`item:${e.itemId}.name`)
        : e.itemId,
      count: cat === 'key' ? '' : `x${e.quantity}`,
      color: TEXTCOLOR.BLACK,
      registerIcon: cat === 'key' && this.registerLookup(e.itemId),
    }));
    this.menuList.setItems(items);
    this.updateDetail(items[0]?.key ?? '');
  }

  private updateDetail(itemId: string): void {
    this.detail.update(itemId);
  }

  private handleSelect(item: IMenuItem): void {
    if (item.key === '__empty__' || item.disabled) return;
    const cat = this.currentCategory();
    const entry = this.entriesByCategory[cat].find((e) => e.itemId === item.key);
    if (!entry) return;
    this.finish({ category: cat, entry });
  }

  private handleCancel(): void {
    this.finish(null);
  }

  private finish(result: BagSelection | null): void {
    if (this.resolveSelection) {
      this.resolveSelection(result);
      this.resolveSelection = null;
    }
  }

  updateWindow(): void {
    this.menuList.updateWindow();
  }

  onRefreshLanguage(): void {
    this.renderCurrentCategory();
  }

  destroy(fromScene?: boolean): void {
    this.menuList.destroy(fromScene);
    super.destroy(fromScene);
  }
}
