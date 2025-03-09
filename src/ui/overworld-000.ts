import { DEPTH } from '../enums/depth';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { Plaza } from './plaza';

export class Overworld000 extends Plaza {
  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene, mode, '000');
  }

  setup(): void {
    super.setup();

    this.setupMap(TEXTURE.MAP_000, [TEXTURE.MAP_L0, TEXTURE.MAP_L1_0]);
    this.setupMapLayer(0, TEXTURE.MAP_L0, DEPTH.GROUND);
    this.setupMapLayer(1, TEXTURE.MAP_L0, DEPTH.GROUND + 1);
    this.setupMapLayer(2, TEXTURE.MAP_L0, DEPTH.GROUND + 2);
    this.setupMapLayer(3, TEXTURE.MAP_L0, DEPTH.GROUND + 3);
    this.setupMapLayer(4, TEXTURE.MAP_L1_0, DEPTH.GROUND + 4);
    this.setupMapForegroundLayer(5, [TEXTURE.MAP_L1_0, TEXTURE.MAP_L0], DEPTH.FOREGROND);

    this.setupNpc(`npc000`, 8, 8, OVERWORLD_TYPE.PLAZA, 'talk');
    this.setupNpc(`npc002`, 11, 8, OVERWORLD_TYPE.PLAZA, 'talk');

    this.setupPlayerInitPos(10, 10);
  }

  show(): void {
    super.show();
  }

  clean(): void {
    super.clean();
  }
}
