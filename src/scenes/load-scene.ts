import { TEXTURE } from '../enums/texture';
import { initI18n } from '../i18n';
import { BaseScene } from './base-scene';

export class LoadingScene extends BaseScene {
  constructor() {
    super('LoadingScene');
  }

  async preload() {
    console.log('LoadingScene preload()');

    await initI18n();

    this.loadImage(TEXTURE.WINDOW_0, 'ui', 'window_0');
    this.loadImage(TEXTURE.WINDOW_1, 'ui', 'window_1');
    this.loadImage(TEXTURE.BG_LOBBY, 'ui', 'bg_lobby');

    this.loadAtlas(TEXTURE.PAUSE_BLACK, 'ui', TEXTURE.PAUSE_BLACK);
    this.loadAtlas(TEXTURE.PAUSE_WHITE, 'ui', TEXTURE.PAUSE_WHITE);

    this.loadImage(TEXTURE.BAR, 'ui', TEXTURE.BAR);
    this.loadImage(TEXTURE.BAR_S, 'ui', TEXTURE.BAR_S);

    this.load.on('complete', () => {
      this.startInGameScene();
    });

    this.load.start();
  }

  private startInGameScene() {
    this.scene.start('InGameScene');
  }
}
