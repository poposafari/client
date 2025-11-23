import i18next from 'i18next';
import { DEPTH, MessageEndDelay, MODE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { QuestionMessageUi } from './question-message-ui';
import { TalkMessageUi } from './talk-message-ui';
import { addBackground, runFadeEffect, Ui } from './ui';
import { deleteAccountApi } from '../api';
import { Option } from '../core/storage/player-option';
import { Game } from '../core/manager/game-manager';

export class AccountDeleteUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private talkUi: TalkMessageUi | null = null;
  private questionUi: QuestionMessageUi | null = null;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    runFadeEffect(this.scene, 800, 'in');

    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createTrackedContainer(width / 2, height / 2);

    const bg = this.addBackground(TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);

    this.container.add(bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    this.container.setVisible(true);

    this.talkUi = new TalkMessageUi(this.scene);
    this.questionUi = new QuestionMessageUi(this.scene);

    await this.talkUi.setup();
    await this.questionUi.setup();

    await this.questionUi.show({
      type: 'default',
      content: i18next.t('message:deleteAccount1'),
      speed: Option.getTextSpeed()!,
      yes: async () => {
        await this.questionUi?.show({
          type: 'default',
          content: i18next.t('message:deleteAccount2'),
          speed: Option.getTextSpeed()!,
          yes: async () => {
            await this.deleteAccount();
          },
          no: async () => {
            await Game.changeMode(MODE.TITLE);
          },
        });
      },
      no: async () => {
        await Game.changeMode(MODE.TITLE);
      },
    });
  }

  protected onClean(): void {
    if (this.talkUi) {
      this.talkUi.clean();
      this.talkUi = null;
    }
    if (this.questionUi) {
      this.questionUi.clean();
      this.questionUi = null;
    }
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]): void {}

  update(time?: number, delta?: number): void {}

  private async deleteAccount(): Promise<void> {
    const res = await deleteAccountApi();

    if (res.result) {
      localStorage.clear();
      await this.talkUi?.show({ type: 'default', content: i18next.t('message:deleteAccount5'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
      await this.talkUi?.show({ type: 'default', content: i18next.t('message:deleteAccount6'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });

      await Game.changeMode(MODE.LOGOUT);
    } else {
      await Game.changeMode(MODE.LOGOUT);
    }
  }
}
