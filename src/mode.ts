import { UiHandler } from './handlers/ui-handler';
import { InGameScene } from './scenes/ingame-scene';

export abstract class Mode {
  // protected ui: UiHandler;
  protected scene: InGameScene;

  constructor(scene: InGameScene) {
    // this.ui = ui;
    this.scene = scene;
  }

  abstract enter(data?: any): void;
  abstract exit(): void;
  abstract update(time?: number, delta?: number): void;
}
