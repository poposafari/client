import type { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText } from '@poposafari/utils';
import i18next from '@poposafari/i18n';

export class QueueUi {
  private overlay!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private positionText!: Phaser.GameObjects.Text;
  private cancelHintText!: Phaser.GameObjects.Text;
  private currentPosition: number | null = null;

  constructor(private readonly scene: GameScene) {}

  show(): void {
    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.overlay = this.scene.add
      .rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.75)
      .setScrollFactor(0)
      .setDepth(DEPTH.MESSAGE);

    this.titleText = addText(
      this.scene,
      cx,
      cy - 160,
      i18next.t('etc:queueWaitingTitle'),
      70,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.titleText.setScrollFactor(0).setDepth(DEPTH.MESSAGE_TOP);

    this.messageText = addText(
      this.scene,
      cx,
      cy - 70,
      i18next.t('etc:queueWaitingMessage'),
      50,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.messageText.setScrollFactor(0).setDepth(DEPTH.MESSAGE_TOP);

    this.positionText = addText(
      this.scene,
      cx,
      cy + 40,
      '',
      80,
      '100',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );
    this.positionText.setScrollFactor(0).setDepth(DEPTH.MESSAGE_TOP);

    this.cancelHintText = addText(
      this.scene,
      cx,
      cy + 160,
      i18next.t('etc:queueCancelHint'),
      45,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.cancelHintText.setScrollFactor(0).setDepth(DEPTH.MESSAGE_TOP);
  }

  setPosition(position: number | null): void {
    this.currentPosition = position;
    if (!this.positionText) return;
    this.positionText.setText(this.formatPositionText(position));
  }

  hide(): void {
    this.overlay?.destroy();
    this.titleText?.destroy();
    this.messageText?.destroy();
    this.positionText?.destroy();
    this.cancelHintText?.destroy();
  }

  onRefreshLanguage(): void {
    this.titleText?.setText(i18next.t('etc:queueWaitingTitle'));
    this.messageText?.setText(i18next.t('etc:queueWaitingMessage'));
    this.cancelHintText?.setText(i18next.t('etc:queueCancelHint'));
    this.positionText?.setText(this.formatPositionText(this.currentPosition));
  }

  private formatPositionText(position: number | null): string {
    if (position === null) return '';
    if (position <= 0) return i18next.t('etc:queueImminent');
    return i18next.t('etc:queuePosition', { position: position + 1 });
  }
}
