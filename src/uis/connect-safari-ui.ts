import { DEPTH, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addText, runFadeEffect, Ui } from './ui';

export class ConnectSafariUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    const bg = this.addBackground(TEXTURE.BG_BLACK).setOrigin(0.5, 0.5);

    const text = this.addText(0, 0, i18next.t('menu:connectingSafari'), TEXTSTYLE.MESSAGE_WHITE);
    text.setScale(1);

    this.container.add(bg);
    this.container.add(text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    runFadeEffect(this.scene, 800, 'in');
    this.container.setVisible(true);
  }

  protected onClean(): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}
