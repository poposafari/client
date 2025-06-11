import { eventBus } from '../../core/event-bus';
import { DEPTH } from '../../enums/depth';
import { EVENT } from '../../enums/event';
import { TEXTURE } from '../../enums/texture';
import { InGameScene } from '../../scenes/ingame-scene';
import { OverworldUi } from './overworld-ui';

export class Overworld011 extends OverworldUi {
  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    super.setup();
  }

  async show(): Promise<void> {
    this.map.setup(TEXTURE.OVERWORLD_011, [TEXTURE.TILE_FLOOR, TEXTURE.TILE_EDGE, TEXTURE.TILE_OBJECT, TEXTURE.TILE_OBJECT_URBAN]);
    this.map.setLayer(0, TEXTURE.TILE_FLOOR, DEPTH.GROUND);
    this.map.setLayer(1, TEXTURE.TILE_FLOOR, DEPTH.GROUND + 1);
    this.map.setLayer(2, TEXTURE.TILE_EDGE, DEPTH.GROUND + 2);
    this.map.setLayer(3, TEXTURE.TILE_OBJECT, DEPTH.GROUND + 3);
    this.map.setLayer(4, TEXTURE.TILE_OBJECT_URBAN, DEPTH.GROUND + 4);
    this.map.setForegroundLayer(5, [TEXTURE.TILE_OBJECT], DEPTH.FOREGROND);

    super.show();

    eventBus.emit(EVENT.UPDATE_OVERWORLD_MENU, true);
  }

  clean(): void {
    super.clean();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
