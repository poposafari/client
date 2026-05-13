import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { screenFadeIn } from '@poposafari/utils';
import { PokeRaderUi } from './poke-rader.ui';

export class PokeRaderPhase implements IGamePhase {
  private ui: PokeRaderUi | null = null;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new PokeRaderUi(this.scene);
    this.ui.show();
    screenFadeIn(this.scene, { duration: 800 });
    await this.ui.waitForExit();
    this.scene.popPhase();
  }

  exit(): void {
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
      this.ui = null;
    }
  }

  onPause?(): void {}
  onResume?(): void {}
}
