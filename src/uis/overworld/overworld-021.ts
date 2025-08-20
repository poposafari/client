import { eventBus } from '../../core/event-bus';
import { DEPTH } from '../../enums/depth';
import { EVENT } from '../../enums/event';
import { OVERWORLD_TYPE } from '../../enums/overworld-type';
import { TEXTURE } from '../../enums/texture';
import { InGameScene } from '../../scenes/ingame-scene';
import { OverworldInfo } from '../../storage/overworld-info';
import { Overworld } from './overworld';
import { OverworldUi } from './overworld-ui';

export class Overworld021 extends Overworld {
  constructor(ui: OverworldUi) {
    super(ui);
  }

  setup(): void {
    this.ui.setType(OVERWORLD_TYPE.SAFARI);
    OverworldInfo.getInstance().setKey('021');

    this.ui.getMap().setup(TEXTURE.OVERWORLD_021, [TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT]);
    this.ui.getMap().setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.ui.getMap().setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    this.ui.getMap().setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    this.ui.getMap().setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    this.ui.getMap().setLayer(4, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 4);
    this.ui.getMap().setLayer(5, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 5);
    this.ui.getMap().setForegroundLayer(6, [TEXTURE.OUTDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    eventBus.emit(EVENT.UPDATE_OVERWORLD_MENU, true);
  }
}
