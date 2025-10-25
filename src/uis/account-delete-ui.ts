import i18next from 'i18next';
import { DEPTH, MODE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { QuestionMessageUi } from './question-message-ui';
import { TalkMessageUi } from './talk-message-ui';
import { addBackground, runFadeEffect, Ui } from './ui';
import { deleteAccountApi } from '../api';
import { GM } from '../core/game-manager';

export class AccountDeleteUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private talkUi: TalkMessageUi;
  private questionUi: QuestionMessageUi;

  constructor(scene: InGameScene) {
    super(scene);

    this.talkUi = new TalkMessageUi(scene);
    this.questionUi = new QuestionMessageUi(scene);
  }

  setup(): void {
    runFadeEffect(this.scene, 800, 'in');

    const width = this.getWidth();
    const height = this.getHeight();

    this.talkUi.setup();
    this.questionUi.setup();

    this.container = this.createContainer(width / 2, height / 2);

    const bg = addBackground(this.scene, TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);

    this.container.add(bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    this.container.setVisible(true);

    await this.questionUi.show({
      type: 'default',
      content: i18next.t('message:deleteAccount1'),
      speed: GM.getUserOption()?.getTextSpeed()!,
      yes: async () => {
        await this.questionUi.show({
          type: 'default',
          content: i18next.t('message:deleteAccount2'),
          speed: GM.getUserOption()?.getTextSpeed()!,
          yes: async () => {
            await this.deleteAccount();
          },
          no: async () => {
            GM.changeMode(MODE.TITLE, false);
          },
        });
      },
      no: async () => {
        GM.changeMode(MODE.TITLE, false);
      },
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]): void {}

  update(time?: number, delta?: number): void {}

  private async deleteAccount(): Promise<void> {
    GM.changeMode(MODE.CONNECT_ACCOUNT_DELETE);
    const res = await deleteAccountApi();

    if (res.result) {
      localStorage.clear();
      await this.talkUi.show({ type: 'default', content: i18next.t('message:deleteAccount5'), speed: GM.getUserOption()?.getTextSpeed()! });
      await this.talkUi.show({ type: 'default', content: i18next.t('message:deleteAccount6'), speed: GM.getUserOption()?.getTextSpeed()! });
      GM.changeMode(MODE.LOGIN);
    }
  }
}
