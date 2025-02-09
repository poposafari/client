import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { InitPos, OverworldUi } from './overworld-ui';

export class Plaza extends OverworldUi {
  constructor(scene: InGameScene, mode: OverworldMode, key: string) {
    super(scene, mode, key);
  }

  setup(): void {
    super.setup();
  }

  show(data: InitPos): void {
    super.show(data);
  }

  clean(): void {
    super.clean();
  }
}
