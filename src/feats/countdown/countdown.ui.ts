import type { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText } from '@poposafari/utils';
import i18next from '@poposafari/i18n';

export class CountdownUi {
  private overlay!: Phaser.GameObjects.Rectangle;
  private mainText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  constructor(private readonly scene: GameScene) {}

  show(): void {
    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.overlay = this.scene.add
      .rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.7)
      .setScrollFactor(0)
      .setDepth(DEPTH.MESSAGE);

    this.mainText = addText(
      this.scene,
      cx,
      cy - 40,
      '',
      90,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.mainText.setScrollFactor(0).setDepth(DEPTH.MESSAGE_TOP);

    this.hintText = addText(
      this.scene,
      cx,
      cy + 80,
      i18next.t('msg:idleHintAnyKey'),
      55,
      '100',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );
    this.hintText.setScrollFactor(0).setDepth(DEPTH.MESSAGE_TOP);
  }

  setRemainingSeconds(seconds: number): void {
    if (!this.mainText) return;
    this.mainText.setText(i18next.t('msg:idleCountdown', { seconds }));
  }

  hide(): void {
    this.overlay?.destroy();
    this.mainText?.destroy();
    this.hintText?.destroy();
  }
}
