import { eventBus } from '../../core/event-bus';
import { DEPTH } from '../../enums/depth';
import { EVENT } from '../../enums/event';
import { OVERWORLD_TYPE } from '../../enums/overworld-type';
import { TEXTURE } from '../../enums/texture';
import { InGameScene } from '../../scenes/ingame-scene';
import { OverworldInfo } from '../../storage/overworld-info';
import { OverworldUi } from './overworld-ui';

export class Overworld002 extends OverworldUi {
  constructor(scene: InGameScene) {
    super(scene, OVERWORLD_TYPE.PLAZA);
  }

  setup(): void {
    super.setup();
  }

  show(): void {
    OverworldInfo.getInstance().setKey('002');

    this.map.setup(TEXTURE.OVERWORLD_002, [TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_URBAN]);
    this.map.setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.map.setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    this.map.setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    this.map.setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    this.map.setLayer(4, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 4);
    this.map.setLayer(5, TEXTURE.OUTDOOR_TILE_URBAN, DEPTH.GROUND + 5);
    this.map.setLayer(6, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 6);
    this.map.setLayer(7, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 7);
    this.map.setLayer(8, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 8);
    this.map.setLayer(9, TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, DEPTH.GROUND + 9);
    this.map.setForegroundLayer(10, [TEXTURE.OUTDOOR_TILE_OBJECT_URBAN, TEXTURE.OUTDOOR_TILE_OBJECT, TEXTURE.OUTDOOR_TILE_URBAN], DEPTH.FOREGROND);

    this.npc.setup(`npc001`, 44, 84, OVERWORLD_TYPE.PLAZA, 'talk');
    // this.npc.setup(`npc002`, 76, 41, OVERWORLD_TYPE.PLAZA, 'talk');
    this.npc.setup(`npc000`, 76, 41, OVERWORLD_TYPE.PLAZA, 'talk');

    super.show();

    eventBus.emit(EVENT.UPDATE_OVERWORLD_MENU, false);
  }

  clean(): void {
    super.clean();
  }
}
