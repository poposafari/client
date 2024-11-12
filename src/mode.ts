import { MODE } from './enums/mode';
import { InGameScene } from './scenes/ingame-scene';

export abstract class Mode {
  protected scene: InGameScene;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  abstract init(): void;
  abstract enter(): void;
  abstract exit(): void;
}
