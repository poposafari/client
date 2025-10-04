import { DEPTH, TEXTURE } from '../enums';
import { addBackground, Ui } from './ui';

export class WelcomeUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);

    this.container.add(bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE - 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
