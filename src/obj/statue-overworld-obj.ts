import { OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { StatueType } from '../types';
import { ImmovableOverworldObj } from './immovable-overworld-obj';

export class StatueOverworldObj extends ImmovableOverworldObj {
  private key: string;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string, key: string) {
    super(scene, texture, x, y, name, OBJECT.STATUE);
    this.key = key;
  }

  reaction(): string {
    return this.key;
  }
}
