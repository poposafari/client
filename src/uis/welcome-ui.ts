import { DEPTH, MessageEndDelay, MODE, TEXTURE } from '../enums';
import { TalkMessageUi } from './talk-message-ui';
import { Ui } from './ui';
import i18next from '../i18n';
import { Option } from '../core/storage/player-option';
import { Game } from '../core/manager/game-manager';

export class WelcomeUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private talkUi: TalkMessageUi | null = null;

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createTrackedContainer(width / 2, height / 2);

    const bg = this.addBackground(TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);

    this.container.add(bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE - 1);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    this.container.setVisible(true);

    this.talkUi = new TalkMessageUi(this.scene);
    await this.talkUi.setup();

    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame1'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame2'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame3'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame4'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame5'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
    await this.talkUi.show({ type: 'default', content: i18next.t('message:introNewgame6'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });

    Game.changeMode(MODE.TITLE);
  }

  protected onClean(): void {
    if (this.talkUi) {
      this.talkUi.clean();
      this.talkUi = null;
    }
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(time: number, delta: number): void {}
}
