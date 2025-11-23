import i18next from 'i18next';
import { restoreDeleteAccountApi } from '../api';
import { DEPTH, MessageEndDelay, MODE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { QuestionMessageUi } from './question-message-ui';
import { TalkMessageUi } from './talk-message-ui';
import { Ui } from './ui';
import { formatDateTime, replacePercentSymbol } from '../utils/string-util';
import { Game } from '../core/manager/game-manager';
import { Option } from '../core/storage/player-option';

export class AccountDeleteRestoreUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private talkUi: TalkMessageUi | null = null;
  private questionUi: QuestionMessageUi | null = null;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createTrackedContainer(width / 2, height / 2);

    const bg = this.addBackground(TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);

    this.container.add(bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TITLE);
    this.container.setScrollFactor(0);
  }

  async show(data: string): Promise<void> {
    this.container.setVisible(true);

    this.talkUi = new TalkMessageUi(this.scene);
    this.questionUi = new QuestionMessageUi(this.scene);
    await this.talkUi.setup();
    await this.questionUi.setup();

    await this.talkUi.show({
      type: 'default',
      content: replacePercentSymbol(i18next.t('message:deleteRestoreAccount1'), [formatDateTime(data)]),
      speed: Option.getTextSpeed()!,
      endDelay: MessageEndDelay.DEFAULT,
    });

    await this.questionUi.show({
      type: 'default',
      content: i18next.t('message:deleteRestoreAccount2'),
      speed: Option.getTextSpeed()!,
      yes: async () => {
        const res = await restoreDeleteAccountApi();

        if (res.result) {
          await this.talkUi?.show({ type: 'default', content: i18next.t('message:deleteRestoreAccount3'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
          await Game.changeMode(MODE.CHECK_INGAME_DATA);
        }
      },
      no: async () => {
        Game.changeMode(MODE.LOGOUT);
      },
    });
  }

  protected onClean(): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]): void {}

  update(time?: number, delta?: number): void {}

  private async showRestoreMessage(): Promise<void> {}
}
