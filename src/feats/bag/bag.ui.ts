import { ItemCategory, TEXTURE } from '@poposafari/types';
import { BaseBagUi } from './base-bag.ui';
import { BAG_CATEGORIES } from './bag.constants';

export class BagUi extends BaseBagUi {
  protected getBackgroundTexture(): TEXTURE {
    return TEXTURE.BG_BAG_M;
  }

  protected getCategories(): ItemCategory[] {
    return BAG_CATEGORIES;
  }
}
