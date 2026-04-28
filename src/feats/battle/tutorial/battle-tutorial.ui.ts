import type { GameScene } from '@poposafari/scenes/game.scene';
import { DEPTH } from '@poposafari/types';
import i18next from '@poposafari/i18n';

export class BattleTutorialUi {
  private overlay: Phaser.GameObjects.Rectangle | null = null;

  constructor(private readonly scene: GameScene) {}

  show(): void {
    const cam = this.scene.cameras.main;
    this.overlay = this.scene.add
      .rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x000000, 0.6)
      .setScrollFactor(0)
      .setDepth(DEPTH.MESSAGE);
  }

  async showLines(messageKeys: string[]): Promise<void> {
    const talk = this.scene.getMessage('talk');
    await talk.showMessage(
      messageKeys.map((key) => i18next.t(key)),
      { name: '', showHint: false },
    );
  }

  hide(): void {
    this.overlay?.setVisible(false);
  }

  destroy(): void {
    this.overlay?.destroy();
    this.overlay = null;
  }
}
