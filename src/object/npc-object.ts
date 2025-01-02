import { OBJECT } from '../enums/object-type';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { BaseObject } from './base-object';

export let npcs: Map<string, NpcObject> = new Map();

export class NpcObject extends BaseObject {
  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, nickname: string, type: OBJECT) {
    super(scene, texture, x, y, nickname);

    this.getSprite().setScale(1.5);
    npcs.set(texture, this);
  }
}
