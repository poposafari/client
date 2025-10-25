import { OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { PostOfficeType } from '../types';
import { ImmovableOverworldObj } from './immovable-overworld-obj';

export class PostCheckoutOverworldObj extends ImmovableOverworldObj {
  private postType: PostOfficeType;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string, postType: PostOfficeType) {
    super(scene, texture, x, y, name, OBJECT.STATUE);

    this.postType = postType;
  }

  reaction(): PostOfficeType {
    return this.postType;
  }
}
