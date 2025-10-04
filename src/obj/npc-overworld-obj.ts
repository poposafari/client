import { DIRECTION, OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { ImmovableOverworldObj } from './immovable-overworld-obj';

export class NpcOverworldObj extends ImmovableOverworldObj {
  private key: string;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string) {
    super(scene, texture, x, y, name, OBJECT.NPC);

    this.key = texture;
    this.setSpriteScale(1.6);
  }

  reaction(direction: DIRECTION) {
    this.lookUser(direction);
  }

  getKey() {
    return this.key;
  }

  private lookUser(playerDirection: DIRECTION) {
    switch (playerDirection) {
      case DIRECTION.LEFT:
        this.stopSpriteAnimation(8);
        break;
      case DIRECTION.RIGHT:
        this.stopSpriteAnimation(4);
        break;
      case DIRECTION.DOWN:
        this.stopSpriteAnimation(12);
        break;
      case DIRECTION.UP:
        this.stopSpriteAnimation(0);
        break;
    }
  }
}
