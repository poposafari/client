import { OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldObj } from './overworld-obj';

export class ImmovableOverworldObj extends OverworldObj {
  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string, objType: OBJECT) {
    super(scene, texture, x, y, name, objType);
  }
}
