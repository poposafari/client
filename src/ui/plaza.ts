import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldUi } from './overworld-test-ui';

export class Plaza extends OverworldUi {
  constructor(scene: InGameScene, mode: OverworldMode, key: string) {
    super(scene, mode, key);
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
