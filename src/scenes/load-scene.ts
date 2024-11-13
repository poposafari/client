import { TEXTURE } from '../enums/texture';
import { BaseScene } from './base-scene';

export class LoadingScene extends BaseScene {
  constructor() {
    super('LoadingScene');
  }

  async preload() {
    console.log('LoadingScene preload()');

    this.loadImage(TEXTURE.WINDOW_0, 'ui', 'window_0');
    this.loadImage(TEXTURE.BG_LOBBY, 'ui', 'bg_lobby');

    this.load.on('complete', () => {
      this.startInGameScene();
    });

    this.load.start();
  }

  private startInGameScene() {
    this.scene.start('InGameScene');
  }
}
