import { eventBus } from '../../core/event-bus';
import { DEPTH } from '../../enums/depth';
import { EVENT } from '../../enums/event';
import { OVERWORLD_TYPE } from '../../enums/overworld-type';
import { TEXTURE } from '../../enums/texture';
import { InGameScene } from '../../scenes/ingame-scene';
import { OverworldInfo } from '../../storage/overworld-info';
import { Overworld } from './overworld';
import { OverworldUi } from './overworld-ui';

export class Overworld003 extends Overworld {
  constructor(ui: OverworldUi) {
    super(ui);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.PLAZA);
    OverworldInfo.getInstance().setKey('003');

    this.ui.getMap().setup(TEXTURE.OVERWORLD_003, [TEXTURE.INDOOR_TILE_FLOOR, TEXTURE.INDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.INDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(2, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setLayer(3, TEXTURE.INDOOR_TILE_OBJECT, DEPTH.GROUND);
    this.ui.getMap().setForegroundLayer(4, [TEXTURE.INDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_MENU, false);
  }
}
