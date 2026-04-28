import { GameScene } from '@poposafari/scenes';
import { MessageConfig, MessageUi } from '@poposafari/feats/message';

export class BattleIdleMessageUi extends MessageUi {
  constructor(scene: GameScene) {
    super(scene);
  }

  onInput(_key: string): void {}

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<any> {
    return Promise.resolve();
  }

  public override show(): void {
    const zoom = this.scene.cameras.main.zoom;
    this.setScale(zoom > 0 ? 1 / zoom : 1);
    this.setVisible(true);
  }

  public override hide(): void {
    this.setVisible(false);
  }

  public override async showMessage(content: string, config: MessageConfig = {}): Promise<void> {
    return super.showMessage(content, { resolveWhen: 'displayed', showHint: false, ...config });
  }

  forceClose(): void {
    this.hide();
  }
}
