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

    // this.setupPlayerInitPos(2, 2);
  }

  show(): void {
    OverworldInfo.getInstance().setKey('002');

    this.map.setup(TEXTURE.OVERWORLD_002, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.map.setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.map.setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    this.map.setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND + 2);
    this.map.setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND + 3);
    this.map.setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    // this.npc.setup(`npc001`, 1, 2, OVERWORLD_TYPE.PLAZA, 'talk');
    // this.npc.setup(`npc002`, 2, 2, OVERWORLD_TYPE.PLAZA, 'talk');
    // this.npc.setup(`npc000`, 3, 2, OVERWORLD_TYPE.PLAZA, 'talk');

    super.show();

    eventBus.emit(EVENT.UPDATE_OVERWORLD_MENU, false);
  }

  clean(): void {
    super.clean();
  }
}
