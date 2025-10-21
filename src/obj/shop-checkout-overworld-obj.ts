import { OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { ShopType } from '../types';
import { ImmovableOverworldObj } from './immovable-overworld-obj';

export class ShopCheckoutOverworldObj extends ImmovableOverworldObj {
  private shopType: ShopType;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string, shopType: ShopType) {
    super(scene, texture, x, y, name, OBJECT.STATUE);

    this.shopType = shopType;
  }

  reaction(): ShopType {
    return this.shopType;
  }
}
