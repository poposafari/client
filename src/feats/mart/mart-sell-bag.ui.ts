import { InputManager } from '@poposafari/core';
import { MasterData } from '@poposafari/core/master.data.ts';
import { GameScene } from '@poposafari/scenes';
import { ItemCategory, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import {
  BagCategoryIconLayout,
  BagDetailLayout,
  BagEntry,
  BagHeaderLayout,
  BagMenuListLayout,
  BagPocketLayout,
  BaseBagUi,
} from '@poposafari/feats/bag/base-bag.ui';

const SELL_CATEGORIES: ItemCategory[] = ['pokeball', 'candy', 'etc', 'tms_hms'];

export class MartSellBagUi extends BaseBagUi {
  private masterData: MasterData;

  constructor(scene: GameScene, inputManager: InputManager) {
    super(scene, inputManager);
    this.masterData = scene.getMasterData();
  }

  protected getBackgroundTexture(): TEXTURE {
    return TEXTURE.BG_MART_SELL;
  }

  protected getCategories(): ItemCategory[] {
    return SELL_CATEGORIES;
  }

  protected filterEntry(entry: BagEntry): boolean {
    return !!this.masterData.getItemData(entry.itemId)?.sellable;
  }

  protected getDetailLayout(): BagDetailLayout {
    const base = super.getDetailLayout();
    return {
      ...base,
      desc: { ...base.desc, x: -650, y: 270, style: TEXTSTYLE.WHITE },
      icon: { ...base.icon, y: 380, scale: 6 },
    };
  }

  protected getMenuListLayout(): BagMenuListLayout {
    const base = super.getMenuListLayout();
    return { ...base, x: +1280, width: 1122, borderPadding: 100 };
  }

  protected getHeaderLayout(): BagHeaderLayout {
    const base = super.getHeaderLayout();
    return { ...base, x: -610, y: -440 };
  }

  protected getPocketLayout(): BagPocketLayout {
    const base = super.getPocketLayout();
    return { ...base, x: -645, y: -100 };
  }

  protected getCategoryIconLayout(): BagCategoryIconLayout {
    const base = super.getCategoryIconLayout();
    return { ...base, x: -890, y: -495, scale: 2.4 };
  }
}
