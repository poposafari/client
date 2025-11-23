import { Option } from '../core/storage/player-option';
import { DEPTH, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { addText, addWindow, Ui } from './ui';

export class ConnectBaseUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const windowScale = 6;

    this.container = this.createContainer(width / 2, height / 2);

    const window = this.addWindow(Option.getFrame('text') as TEXTURE, 0, 0, 700 / windowScale, 200 / windowScale, 16, 16, 16, 16);
    window.setScale(windowScale);
    const text = this.addText(0, 0, i18next.t('menu:connecting'), TEXTSTYLE.DEFAULT_BLACK);
    text.setScale(1);

    window.setSize((text.displayWidth + 200) / windowScale, (text.displayHeight + 100) / windowScale);

    this.container.add(window);
    this.container.add(text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
  }

  protected onClean(): void {}

  pause(data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
