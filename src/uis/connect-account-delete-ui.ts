import { eventBus } from '../core/event-bus';
import { DEPTH } from '../enums/depth';
import { EVENT } from '../enums/event';
import { TEXTURE } from '../enums/texture';
import { addBackground, Ui } from './ui';

export class ConnectAccountDeleteUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BG_LOBBY).setOrigin(0.5, 0.5);

    this.container.add(bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE - 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);

    eventBus.emit(EVENT.ACCOUNT_DELETE);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any) {}

  update(time?: number, delta?: number): void {}
}
