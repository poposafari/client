import i18next from 'i18next';
import { TalkMessageUi } from './talk-message-ui';
import { Ui } from './ui';
import { Option } from '../core/storage/player-option';
import { Game } from '../core/manager/game-manager';
import { MessageEndDelay, MODE } from '../enums';

export class FailTokenUi extends Ui {
  private talkUi: TalkMessageUi | null = null;

  setup(): void {}

  async show(data?: any) {
    this.talkUi = new TalkMessageUi(this.scene);
    await this.talkUi.setup();

    await this.talkUi.show({ type: 'default', content: i18next.t('message:failToken'), speed: Option.getTextSpeed()!, endDelay: MessageEndDelay.DEFAULT });
  }

  protected onClean(): void {
    if (this.talkUi) {
      this.talkUi.clean();
      this.talkUi = null;
    }
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}
