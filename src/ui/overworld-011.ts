import { getSafari } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { Safari } from './safari';

export class Overworld011 extends Safari {
  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene, mode, type, '011');
  }

  setup(): void {
    const initPos = getSafari('011').entryPos;

    super.setup();

    this.setupMap(TEXTURE.MAP_011, [TEXTURE.MAP_L0, TEXTURE.MAP_L1_0]);
    this.setupMapLayer(0, TEXTURE.MAP_L0, DEPTH.GROUND);
    this.setupMapLayer(1, TEXTURE.MAP_L0, DEPTH.GROUND + 1);
    this.setupMapLayer(2, TEXTURE.MAP_L0, DEPTH.GROUND + 2);
    this.setupMapLayer(3, TEXTURE.MAP_L0, DEPTH.GROUND + 3);
    this.setupMapLayer(4, TEXTURE.MAP_L1_0, DEPTH.GROUND + 4);
    this.setupMapForegroundLayer(5, [TEXTURE.MAP_L1_0, TEXTURE.MAP_L0], DEPTH.FOREGROND);

    this.setupNpc(`npc001`, 8, 8, OVERWORLD_TYPE.SAFARI, 'question');

    this.setupPlayerInitPos(initPos.x, initPos.y);
  }

  show(): void {
    super.show();
  }

  clean(): void {
    super.clean();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
