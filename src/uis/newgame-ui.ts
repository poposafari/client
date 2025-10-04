import i18next from 'i18next';
import { DEPTH, MODE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, Ui } from './ui';
import { TalkMessageUi } from './talk-message-ui';
import { GM } from '../core/game-manager';

export class NewgameUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private talkUi: TalkMessageUi;

  constructor(scene: InGameScene) {
    super(scene);

    this.talkUi = new TalkMessageUi(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.talkUi.setup();

    this.container = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);

    this.container.add(bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE - 1);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    this.container.setVisible(true);

    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame1'), speed: GM.getUserOption()?.getTextSpeed()! });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame2'), speed: GM.getUserOption()?.getTextSpeed()! });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame3'), speed: GM.getUserOption()?.getTextSpeed()! });
    GM.changeMode(MODE.TITLE);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
