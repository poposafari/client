import { Option } from '../core/storage/player-option';
import { DEPTH, TEXTSTYLE, TEXTURE } from '../enums';
import i18next from '../i18n';
import { Ui } from './ui';

export class ConnectBaseUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private showTimer: Phaser.Time.TimerEvent | null = null;
  private readonly SHOW_DELAY: number = 5000;

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
    this.cancelShowTimer();
    this.showTimer = this.scene.time.delayedCall(this.SHOW_DELAY, () => {
      this.container.setVisible(true);
      this.showTimer = null;
    });
  }

  protected onClean(): void {
    this.cancelShowTimer();
    this.container.setVisible(false);
  }

  private cancelShowTimer(): void {
    if (this.showTimer) {
      this.showTimer.remove();
      this.showTimer = null;
    }
  }

  pause(data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
