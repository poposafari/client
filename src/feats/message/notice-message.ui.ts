import { InputManager } from '@poposafari/core';
import { KEY, TEXTURE } from '@poposafari/types';
import { MessageConfig, MessageUi } from './message.ui';
import { GameScene } from '@poposafari/scenes';

export class NoticeMessageUi extends MessageUi {
  constructor(scene: GameScene) {
    super(scene);
  }

  onInput(key: string): void {
    if (key === KEY.Z || key === KEY.ENTER) {
      this.close();
    }
  }

  errorEffect(errorMsg: string): void {
    throw new Error('Method not implemented.');
  }
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public override async showMessage(content: string, config: MessageConfig = {}): Promise<void> {
    const configWithWindow: MessageConfig = {
      ...config,
      speed: 0,
      window: config.window ?? TEXTURE.WINDOW_NOTICE_0,
    };

    const originalY = 405;
    this.container.setY(originalY + 200);
    this.container.setAlpha(0);

    const promise = super.showMessage(content, configWithWindow);

    this.scene.tweens.add({
      targets: this.container,
      y: originalY,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });

    return promise;
  }

  protected close(): void {
    this.scene.tweens.add({
      targets: this.container,
      y: this.container.y + 100,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        super.close();
        this.container.setAlpha(1);
        this.container.setY(405);
      },
    });
  }
}
