import { MessageManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { Ui } from './ui';

export class OverworldMessageUi extends Ui {
  private messageManager!: MessageManager;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
  }

  setup(): void {}

  async show(data?: any): Promise<void> {
    this.messageManager = MessageManager.getInstance();
    await this.messageManager.show(this, data);
  }

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}
}
