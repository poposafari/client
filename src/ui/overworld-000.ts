import { DEPTH } from '../enums/depth';
import { OBJECT } from '../enums/object-type';
import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { MAP_SCALE } from '../object/base-object';
import { NpcObject } from '../object/npc-object';
import { InGameScene } from '../scenes/ingame-scene';
import { InitPos } from './overworld-ui';
import { Plaza } from './plaza';

export class Overworld000 extends Plaza {
  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene, mode, '000');
  }

  setup(): void {
    super.setup();
  }

  show(pos: InitPos): void {
    const mode = this.getOverworldMode();
    const location = mode.getPlayerInfo()?.getLocation();

    //map
    this.createMap();

    //overworld-ui show
    if (location) super.show({ x: location?.x, y: location?.y });

    //npc
    this.createNpc();
  }

  clean(): void {
    super.clean();
  }

  private createMap() {
    this.setMap(TEXTURE.MAP_000);

    this.addTileset(TEXTURE.MAP_L0);
    this.addTileset(TEXTURE.MAP_L1_0);

    this.createLayerContainer();

    this.addLayers(0, TEXTURE.MAP_L0, DEPTH.GROUND);
    this.addLayers(1, TEXTURE.MAP_L0, DEPTH.GROUND + 1);
    this.addLayers(2, TEXTURE.MAP_L0, DEPTH.GROUND + 2);
    this.addLayers(3, TEXTURE.MAP_L0, DEPTH.GROUND + 3);
    this.addLayers(4, TEXTURE.MAP_L1_0, DEPTH.GROUND + 4);

    this.addForegroundLayer(5, [TEXTURE.MAP_L1_0, TEXTURE.MAP_L0], DEPTH.FOREGROND);
  }

  private createNpc() {
    this.showNpc(`npc000`, 8, 8, OVERWORLD_TYPE.PLAZA);
    this.showNpc(`npc001`, 10, 8, OVERWORLD_TYPE.PLAZA);
    this.showNpc(`npc002`, 14, 8, OVERWORLD_TYPE.PLAZA);
  }
}
