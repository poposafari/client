import i18next from 'i18next';
import { TEXTURE } from '../enums/texture';
import { addBackground, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { DEPTH } from '../enums/depth';
import { KeyboardHandler } from '../handlers/keyboard-handler';

export class ConnectUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private contentContainer!: Phaser.GameObjects.Container;

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.contentContainer = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BLACK).setOrigin(0.5, 0.5);
    bg.setAlpha(0.5);

    const text = addText(this.scene, 0, 0, i18next.t('menu:connecting'), TEXTSTYLE.LOADING);

    this.container.add(bg);
    this.contentContainer.add(text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP);
    this.container.setScrollFactor(0);

    this.contentContainer.setScale(1);
    this.contentContainer.setVisible(false);
    this.contentContainer.setDepth(DEPTH.TOP + 1);
    this.contentContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.contentContainer.setVisible(true);

    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.contentContainer.setVisible(false);
  }

  pause(data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
