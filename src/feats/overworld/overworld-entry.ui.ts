import { BaseUi } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTURE } from '@poposafari/types';
import { addBackground } from '@poposafari/utils';

export class OverworldEntryUi extends BaseUi {
  private bg!: GImage;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE + 1);
    this.createLayout();
  }

  onInput(_key: string): void {}

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<never> {
    return new Promise(() => {});
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_BLACK);
    this.add([this.bg]);
  }

  setMessage(_msgKey: string): void {}
}
