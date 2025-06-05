import i18next from 'i18next';
import { eventBus } from '../core/event-bus';
import { DEPTH } from '../enums/depth';
import { EVENT } from '../enums/event';
import { TEXTURE } from '../enums/texture';
import { addBackground, Ui } from './ui';
import { MODE } from '../enums/mode';

export class AccountDeleteUi extends Ui {
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
    eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [
      { type: 'sys', format: 'question', content: i18next.t('message:deleteAccount1'), speed: 10, questionNo: EVENT.MOVETO_TITLE_MODE },
      { type: 'sys', format: 'question', content: i18next.t('message:deleteAccount2'), speed: 10, end: EVENT.MOVETO_CONNECT_ACCOUNT_DELETE_MODE, questionNo: EVENT.MOVETO_TITLE_MODE },
    ]);

    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
