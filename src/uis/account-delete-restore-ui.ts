import i18next from 'i18next';
import { restoreDeleteAccountApi } from '../api';
import { DEPTH, MODE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { QuestionMessageUi } from './question-message-ui';
import { TalkMessageUi } from './talk-message-ui';
import { addBackground, Ui } from './ui';
import { formatDateTime, replacePercentSymbol } from '../utils/string-util';
import { GM } from '../core/game-manager';

export class AccountDeleteRestoreUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private talkUi: TalkMessageUi;
  private questionUi: QuestionMessageUi;

  constructor(scene: InGameScene) {
    super(scene);

    this.talkUi = new TalkMessageUi(scene);
    this.questionUi = new QuestionMessageUi(scene);
  }

  setup(): void {
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

  async show(data: string): Promise<void> {
    this.container.setVisible(true);

    await this.talkUi.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:deleteRestoreAccount1'), [formatDateTime(data)]),
      speed: GM.getUserOption()?.getTextSpeed()!,
    });
    await this.showRestoreMessage();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]): void {}

  update(time?: number, delta?: number): void {}

  private async showRestoreMessage(): Promise<void> {
    await this.questionUi.show({
      type: 'default',
      content: i18next.t('message:deleteRestoreAccount2'),
      speed: GM.getUserOption()?.getTextSpeed()!,
      yes: async () => {
        const res = await restoreDeleteAccountApi();

        if (res.result) {
          await this.talkUi.show({ type: 'default', content: i18next.t('message:deleteRestoreAccount3'), speed: GM.getUserOption()?.getTextSpeed()! });
          GM.changeMode(MODE.TITLE);
        }
      },
      no: async () => {
        GM.changeMode(MODE.LOGIN);
      },
    });
  }
}
