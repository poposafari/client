import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { screenFadeIn } from '@poposafari/utils';
import { SafariMapUi } from './safari-map.ui';

export class SafariMapPhase implements IGamePhase {
  private ui: SafariMapUi | null = null;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new SafariMapUi(this.scene);
    this.ui.show();
    screenFadeIn(this.scene, { duration: 800 });
    await this.ui.waitForInput();
    this.scene.popPhase();
  }

  update(time: number, delta: number): void {
    this.ui?.update(time, delta);
  }

  exit(): void {
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
      this.ui = null;
    }
  }
}
