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

    this.setupMap(TEXTURE.OVERWORLD_000, [TEXTURE.TILE_NATURE, TEXTURE.TILE_URBAN]);
    this.setupMapLayer(0, TEXTURE.TILE_NATURE, DEPTH.GROUND);
    this.setupMapLayer(1, TEXTURE.TILE_NATURE, DEPTH.GROUND + 1);
    this.setupMapLayer(2, TEXTURE.TILE_NATURE, DEPTH.GROUND + 2);
    this.setupMapLayer(3, TEXTURE.TILE_NATURE, DEPTH.GROUND + 3);
    this.setupMapLayer(4, TEXTURE.TILE_NATURE, DEPTH.GROUND + 4);
    this.setupMapLayer(5, TEXTURE.TILE_URBAN, DEPTH.GROUND + 5);
    this.setupMapForegroundLayer(6, [TEXTURE.TILE_NATURE, TEXTURE.TILE_URBAN], DEPTH.FOREGROND);

    this.setupNpc(`npc000`, 8, 8, OVERWORLD_TYPE.PLAZA, 'talk');
    this.setupNpc(`npc002`, 11, 8, OVERWORLD_TYPE.PLAZA, 'talk');

    this.setupPlayerInitPos(18, 15);
  }

  show(): void {
    super.show();
  }

  clean(): void {
    super.clean();
  }
}
