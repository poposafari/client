import { MODE } from './enums/mode';
import { GlobalManager, ModeManager } from './managers';
import { InGameScene } from './scenes/ingame-scene';
import { UI } from './ui/ui';

export abstract class Mode {
  protected scene: InGameScene;
  protected manager: ModeManager;
  protected ui!: UI;

  constructor(scene: InGameScene) {
    this.scene = scene;
    this.manager = GlobalManager.get('mode');
  }

  abstract init(): void;
  abstract enter(): void;
  abstract exit(): void;
}
