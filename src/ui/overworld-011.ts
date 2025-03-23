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

    this.setupMap(TEXTURE.OVERWORLD_011, [TEXTURE.TILE_FLOOR, TEXTURE.TILE_EDGE, TEXTURE.TILE_OBJECT, TEXTURE.TILE_OBJECT_URBAN]);
    this.setupMapLayer(0, TEXTURE.TILE_FLOOR, DEPTH.GROUND);
    this.setupMapLayer(1, TEXTURE.TILE_FLOOR, DEPTH.GROUND + 1);
    this.setupMapLayer(2, TEXTURE.TILE_EDGE, DEPTH.GROUND + 3);
    this.setupMapLayer(3, TEXTURE.TILE_OBJECT, DEPTH.GROUND + 4);
    this.setupMapLayer(4, TEXTURE.TILE_OBJECT, DEPTH.GROUND + 5);
    this.setupMapLayer(5, TEXTURE.TILE_OBJECT_URBAN, DEPTH.GROUND + 6);
    this.setupMapForegroundLayer(6, [TEXTURE.TILE_OBJECT], DEPTH.FOREGROND);

    this.setupNpc(`npc001`, 6, 6, OVERWORLD_TYPE.SAFARI, 'question');

    this.setupPlayerInitPos(initPos.x, initPos.y);
  }

  async show(): Promise<void> {
    super.show();
  }

  clean(): void {
    super.clean();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
