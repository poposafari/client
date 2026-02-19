import { InputManager } from '@poposafari/core';
import { KEY } from '@poposafari/types';
import { MessageConfig, MessageUi } from './message.ui';
import { GameScene } from '@poposafari/scenes';

export class QuestionMessageUi extends MessageUi {
  constructor(scene: GameScene) {
    super(scene);
  }

  onInput(key: string): void {
    // if (key === KEY.Z || key === KEY.ENTER) {
    //   this.close();
    // }
  }

  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public async showMessage(content: string, config: MessageConfig = {}): Promise<void> {
    return super.showMessage(content, config);
  }

  protected close(): void {
    super.close();
  }
}
