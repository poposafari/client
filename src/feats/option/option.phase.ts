import { IGamePhase } from '@poposafari/core';
import { GameEvent, GameScene } from '@poposafari/scenes';
import { OptionUi } from './option.ui';

export class OptionPhase implements IGamePhase {
  private ui: OptionUi | null = null;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new OptionUi(this.scene);
    this.ui.show();
    await this.ui.waitForExit();
    this.scene.popPhase();
  }

  exit(): void {
    if (!this.ui) return;

    const { windowDirty, languageDirty } = this.ui.getDirty();

    this.ui.hide();
    this.ui.destroy();
    this.ui = null;

    this.scene.getOption().saveToCache();

    if (windowDirty) this.scene.emitEvent(GameEvent.WINDOW_CHANGED);
    if (languageDirty) this.scene.emitEvent(GameEvent.LANGUAGE_CHANGED);
  }

  onRefreshLanguage?(): void {
    this.ui?.onRefreshLanguage();
  }

  onPause?(): void {}
  onResume?(): void {}
}
