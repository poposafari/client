import { eventBus } from '../../core/event-bus';
import { DEPTH } from '../../enums/depth';
import { EVENT } from '../../enums/event';
import { OVERWORLD_TYPE } from '../../enums/overworld-type';
import { TEXTURE } from '../../enums/texture';
import { InGameScene } from '../../scenes/ingame-scene';
import { OverworldInfo } from '../../storage/overworld-info';
import { OverworldUi } from './overworld-ui';

export class Overworld021 extends OverworldUi {
  constructor(scene: InGameScene) {
    super(scene, OVERWORLD_TYPE.SAFARI);
  }

  setup(): void {
    super.setup();
  }

  show(): void {
    OverworldInfo.getInstance().setKey('021');

    this.map.setup(TEXTURE.OVERWORLD_021, [TEXTURE.OUTDOOR_TILE_FLOOR, TEXTURE.OUTDOOR_TILE_EDGE, TEXTURE.OUTDOOR_TILE_OBJECT]);
    this.map.setLayer(0, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND);
    this.map.setLayer(1, TEXTURE.OUTDOOR_TILE_FLOOR, DEPTH.GROUND + 1);
    this.map.setLayer(2, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 2);
    this.map.setLayer(3, TEXTURE.OUTDOOR_TILE_EDGE, DEPTH.GROUND + 3);
    this.map.setLayer(4, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 4);
    this.map.setLayer(5, TEXTURE.OUTDOOR_TILE_OBJECT, DEPTH.GROUND + 5);
    this.map.setForegroundLayer(6, [TEXTURE.OUTDOOR_TILE_OBJECT], DEPTH.FOREGROND);

    super.show();

    eventBus.emit(EVENT.UPDATE_OVERWORLD_MENU, true);
  }

  clean(): void {
    super.clean();
  }
}
