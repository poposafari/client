import { DEPTH } from '../enums/depth';
import { OBJECT } from '../enums/object-type';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { MAP_SCALE } from '../object/base-object';
import { NpcObject } from '../object/npc-object';
import { InGameScene } from '../scenes/ingame-scene';
import { Safari } from './safari';

export class Overworld006 extends Safari {
  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene, mode, type, '006');
  }

  setup(): void {
    super.setup();
  }

  show(): void {}

  clean(): void {
    super.clean();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
