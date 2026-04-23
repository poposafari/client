import { ItemCategory, TEXTURE } from '@poposafari/types';
import { BaseBagUi } from './base-bag.ui';
import { BAG_CATEGORIES } from './bag.constants';

export class BagUi extends BaseBagUi {
  protected getBackgroundTexture(): TEXTURE {
    return this.scene.getUser()?.getProfile().gender === 'female'
      ? TEXTURE.BG_BAG_F
      : TEXTURE.BG_BAG_M;
  }

  protected getCategories(): ItemCategory[] {
    return BAG_CATEGORIES;
  }
}
