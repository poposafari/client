import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { Overworld } from './overworld';

export class Plaza extends Overworld {
  constructor(scene: InGameScene, mode: OverworldMode, type: OVERWORLD_TYPE) {
    super(scene, mode, type);
  }

  setup(): void {
    super.setup();
  }

  show(): void {
    super.show();
  }

  clean(): void {
    super.clean();
  }
}
