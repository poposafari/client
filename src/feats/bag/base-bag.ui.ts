import { BaseUi, IInputHandler, InputManager, IRefreshableLanguage } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  DEPTH,
  EASE,
  IMenuItem,
  ItemCategory,
  KEY,
  SFX,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import { addImage, addText, screenFadeIn } from '@poposafari/utils';
import i18next from '@poposafari/i18n';
import { ItemDetailContainer } from '@poposafari/containers/item-detail.container';
import { MenuListUi } from '../menu/menu-list.ui';

export interface BagEntry {
  itemId: string;
  quantity: number;
  register: boolean;
}

export interface BagSelection {
  category: ItemCategory;
  entry: BagEntry;
}

export interface BagHeaderLayout {
  x: number;
  y: number;
}

export interface BagPocketLayout {
  x: number;
  y: number;
  scale: number;
}

export interface BagDetailLayout {
  icon: { x: number; y: number; scale: number };
  name: {
    x: number;
    y: number;
    fontSize: number;
    style?: TEXTSTYLE;
    shadow?: TEXTSHADOW;
  };
  desc: {
    x: number;
    y: number;
    fontSize: number;
    style?: TEXTSTYLE;
    shadow?: TEXTSHADOW;
  };
}

export interface BagMenuListLayout {
  x: number;
  y: number;
  width: number;
  visibleCount: number;
  itemHeight: number;
  borderPadding?: number;
}

export interface BagCategoryIconLayout {
  x: number;
  y: number;
  scale: number;
}

const DEFAULT_HEADER_LAYOUT: BagHeaderLayout = { x: -505, y: -450 };
const DEFAULT_POCKET_LAYOUT: BagPocketLayout = { x: -510, y: -160, scale: 7.2 };
const DEFAULT_CATEGORY_ICON_LAYOUT: BagCategoryIconLayout = { x: -855, y: -455, scale: 3 };
const DEFAULT_DETAIL_LAYOUT: BagDetailLayout = {
  icon: { x: -790, y: 135, scale: 5 },
  name: { x: 0, y: 0, fontSize: 70 },
  desc: { x: -890, y: 270, fontSize: 85 },
};
const DEFAULT_MENU_LIST_LAYOUT: BagMenuListLayout = {
  x: 1370,
  y: 380,
  width: 960,
  visibleCount: 6,
  itemHeight: 100,
};

export abstract class BaseBagUi extends BaseUi implements IInputHandler, IRefreshableLanguage {
  scene: GameScene;

  protected readonly FONT_SIZE = 70;

  protected background!: GImage;
  protected headerText!: GText;
  protected headerArrowLeft!: GImage;
  protected headerArrowRight!: GImage;
  protected headerPocketIcon!: GImage;
  protected pocket!: GImage;
  protected detail!: ItemDetailContainer;
  protected menuList!: MenuListUi;

  protected categoryIndex = 0;
  protected entriesByCategory: Record<ItemCategory, BagEntry[]> = {
    pokeball: [],
    candy: [],
    etc: [],
    tms_hms: [],
    key: [],
  };

  private resolveSelection: ((result: BagSelection | null) => void) | null = null;
  private isPocketAnimating = false;

  protected registerLookup: (itemId: string) => boolean = () => false;

  constructor(scene: GameScene, inputManager: InputManager) {
    super(scene, inputManager, DEPTH.MESSAGE);
    this.scene = scene;
    this.createLayout();
  }

  // --- 서브클래스 훅 ---
  protected abstract getBackgroundTexture(): TEXTURE;
  protected abstract getCategories(): ItemCategory[];
  protected filterEntry(_entry: BagEntry): boolean {
    return true;
  }

  // --- 레이아웃 훅 (필요한 영역만 부분 오버라이드 가능) ---
  protected getHeaderLayout(): BagHeaderLayout {
    return DEFAULT_HEADER_LAYOUT;
  }
  protected getPocketLayout(): BagPocketLayout {
    return DEFAULT_POCKET_LAYOUT;
  }
  protected getDetailLayout(): BagDetailLayout {
    return DEFAULT_DETAIL_LAYOUT;
  }
  protected getMenuListLayout(): BagMenuListLayout {
    return DEFAULT_MENU_LIST_LAYOUT;
  }
  protected getCategoryIconLayout(): BagCategoryIconLayout {
    return DEFAULT_CATEGORY_ICON_LAYOUT;
  }

  createLayout(): void {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;

    this.background = addImage(this.scene, this.getBackgroundTexture(), undefined, 0, 0);
    this.background.setDisplaySize(screenWidth, screenHeight);
    this.add(this.background);

    const headerLayout = this.getHeaderLayout();
    this.headerText = addText(
      this.scene,
      headerLayout.x,
      headerLayout.y,
      '',
      80,
      '100',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.headerText.setOrigin(0.5, 0.5);
    this.add(this.headerText);

    this.headerArrowLeft = addImage(
      this.scene,
      TEXTURE.CURSOR_BLACK,
      undefined,
      headerLayout.x - 240,
      headerLayout.y - 5,
    ).setScale(3);
    this.headerArrowLeft.setFlipX(true);
    this.add(this.headerArrowLeft);

    const firstCat = this.getCategories()[0];
    const categoryIconLayout = this.getCategoryIconLayout();
    this.headerPocketIcon = addImage(
      this.scene,
      `icon_pocket_${firstCat}`,
      undefined,
      categoryIconLayout.x,
      categoryIconLayout.y,
    ).setScale(categoryIconLayout.scale);
    this.add(this.headerPocketIcon);

    this.headerArrowRight = addImage(
      this.scene,
      TEXTURE.CURSOR_BLACK,
      undefined,
      headerLayout.x + 240,
      headerLayout.y - 5,
    ).setScale(3);
    this.add(this.headerArrowRight);

    const pocketLayout = this.getPocketLayout();
    const firstCategory = this.getCategories()[0];
    this.pocket = addImage(
      this.scene,
      `pocket_${this.getGenderKey()}_${firstCategory}`,
      undefined,
      pocketLayout.x,
      pocketLayout.y,
    ).setScale(pocketLayout.scale);
    this.add(this.pocket);

    const detailLayout = this.getDetailLayout();
    this.detail = new ItemDetailContainer(this.scene, {
      icon: {
        x: detailLayout.icon.x,
        y: detailLayout.icon.y,
        scale: detailLayout.icon.scale,
      },
      name: {
        x: detailLayout.name.x,
        y: detailLayout.name.y,
        fontSize: detailLayout.name.fontSize,
        style: detailLayout.name.style ?? TEXTSTYLE.WHITE,
        shadow: detailLayout.name.shadow ?? TEXTSHADOW.GRAY,
        visible: false,
      },
      desc: {
        x: detailLayout.desc.x,
        y: detailLayout.desc.y,
        fontSize: detailLayout.desc.fontSize,
        style: detailLayout.desc.style ?? TEXTSTYLE.BLACK,
        shadow: detailLayout.desc.shadow ?? TEXTSHADOW.GRAY,
        visible: true,
      },
    });
    this.add(this.detail);

    const menuListLayout = this.getMenuListLayout();
    this.menuList = new MenuListUi(this.scene, this.inputManager, {
      x: menuListLayout.x,
      y: menuListLayout.y,
      width: menuListLayout.width,
      visibleCount: menuListLayout.visibleCount,
      itemHeight: menuListLayout.itemHeight,
      borderPadding: menuListLayout.borderPadding,
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
  }

  onInput(key: string): void {
    if (this.isPocketAnimating) return;
    switch (key) {
      case KEY.LEFT:
        this.scene.getAudio().playEffect(SFX.BAG_CURSOR);
        this.shiftCategory(-1);
        return;
      case KEY.RIGHT:
        this.scene.getAudio().playEffect(SFX.BAG_CURSOR);
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
      if (!this.filterEntry(e)) continue;
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
      screenFadeIn(this.scene, { duration: 800 });
      this.playPocketDropAnimation();
    }
    return new Promise((resolve) => {
      this.resolveSelection = resolve;
    });
  }

  private playPocketDropAnimation(): void {
    const pocketLayout = this.getPocketLayout();
    const screenHeight = this.scene.scale.height;
    const startY = -screenHeight / 2 - 200;
    const endY = pocketLayout.y;

    this.isPocketAnimating = true;
    this.pocket.setY(startY);
    this.scene.tweens.add({
      targets: this.pocket,
      y: endY,
      duration: 800,
      ease: EASE.BOUNCE_EASEOUT,
      onComplete: () => {
        this.isPocketAnimating = false;
      },
    });
  }

  hide(): void {
    super.hide();
    this.menuList.hide();
  }

  private currentCategory(): ItemCategory {
    return this.getCategories()[this.categoryIndex];
  }

  private getGenderKey(): 'm' | 'f' {
    return this.scene.getUser()?.getProfile().gender === 'female' ? 'f' : 'm';
  }

  protected shiftCategory(delta: number): void {
    const cats = this.getCategories();
    this.categoryIndex = (this.categoryIndex + delta + cats.length) % cats.length;
    this.renderCurrentCategory();
  }

  protected renderCurrentCategory(): void {
    const cat = this.currentCategory();
    this.headerText.setText(i18next.t(`bag:category.${cat}`));
    this.pocket.setTexture(`pocket_${this.getGenderKey()}_${cat}`);
    this.headerPocketIcon.setTexture(`icon_pocket_${cat}`);

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

  protected updateDetail(itemId: string): void {
    this.detail.update(itemId);
  }

  protected handleSelect(item: IMenuItem): void {
    if (item.key === '__empty__' || item.disabled) return;
    const cat = this.currentCategory();
    const entry = this.entriesByCategory[cat].find((e) => e.itemId === item.key);
    if (!entry) return;
    this.finish({ category: cat, entry });
  }

  protected handleCancel(): void {
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
