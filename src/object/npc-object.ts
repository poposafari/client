import { DIRECTION } from '../enums/direction';
import { OBJECT } from '../enums/object-type';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { BaseObject } from './base-object';

export let npcs: Map<string, NpcObject> = new Map();

export class NpcObject extends BaseObject {
  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, nickname: string, type: OBJECT) {
    super(scene, texture, x, y, nickname);

    this.getSprite().setScale(1.6);
    npcs.set(texture, this);
  }

  reaction(playerDirection: DIRECTION) {
    switch (playerDirection) {
      case DIRECTION.LEFT:
        this.setSpriteFrame(8);
        break;
      case DIRECTION.RIGHT:
        this.setSpriteFrame(4);
        break;
      case DIRECTION.DOWN:
        this.setSpriteFrame(12);
        break;
      case DIRECTION.UP:
        this.setSpriteFrame(0);
        break;
    }
  }
}
