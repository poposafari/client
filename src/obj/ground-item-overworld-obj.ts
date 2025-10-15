import { OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { GroundItemRes } from '../types';
import { matchItemRank } from '../utils/string-util';
import { ImmovableOverworldObj } from './immovable-overworld-obj';

export class GroundItemOverworldObj extends ImmovableOverworldObj {
  private data: GroundItemRes;

  constructor(scene: InGameScene, data: GroundItemRes, x: number, y: number) {
    const texture = TEXTURE.GROUND_ITEM;
    super(scene, texture, x, y, '', OBJECT.GROUND_ITEM);

    this.data = data;
    this.setSpriteScale(1.5);
    this.getSprite().setTexture(TEXTURE.GROUND_ITEM, `ground_item-${matchItemRank(this.data.rank)}`);
  }

  caught() {
    this.destroy();
    this.data.catch = true;
  }

  isCatchable() {
    return this.data.catch;
  }

  reaction(): GroundItemRes {
    return this.data;
  }
}
