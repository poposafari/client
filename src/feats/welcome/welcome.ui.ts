import { BaseUi, IInputHandler, InputManager } from '@poposafari/core';
import { DEPTH, TEXTURE } from '@poposafari/types';
import { addBackground, getBackgroundKey } from '@poposafari/utils';
import { GameScene } from '@poposafari/scenes';
import i18next from 'i18next';

export class WelcomeUi extends BaseUi implements IInputHandler {
  private bg!: GImage;
  scene!: GameScene;

  constructor(scene: GameScene, inputManager: InputManager) {
    super(scene, inputManager, DEPTH.DEFAULT);

    this.scene = scene;
    this.createLayout();
  }

  onInput(key: string): void {}

  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  createLayout() {
    this.bg = addBackground(this.scene, TEXTURE.BG_1);

    this.add([this.bg]);
  }

  async showWelcomeMsg() {
    const talk = this.scene.getMessage('talk');

    await talk.showMessage(i18next.t('msg:welcome_0'), { name: '테스트맨' });
    await talk.showMessage(i18next.t('msg:welcome_1'), { name: '테스트맨' });
    await talk.showMessage(i18next.t('msg:welcome_2'), { name: '테스트맨' });
    await talk.showMessage(i18next.t('msg:welcome_3'), { name: '테스트맨' });
    await talk.showMessage(i18next.t('msg:welcome_4'), { name: '테스트맨' });
    await talk.showMessage(i18next.t('msg:welcome_5'), { name: '테스트맨' });
  }

  show(): void {
    this.bg.setTexture(getBackgroundKey());
    super.show();
  }
}
