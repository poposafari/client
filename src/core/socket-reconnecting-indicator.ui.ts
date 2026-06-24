import i18next from 'i18next';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addBackground, addText } from '@poposafari/utils';
import { BaseUi } from './base.ui';

const SPRITE_SCALE = 4;
const ROTATION_DURATION_MS = 800;
const TEXT_OFFSET_Y = 100;
const BG_ALPHA = 0.7;

export class SocketReconnectingUi extends BaseUi {
  scene: GameScene;

  private bg!: GImage;
  private ball!: Phaser.GameObjects.Image;
  private text!: GText;
  private rotateTween: Phaser.Tweens.Tween | null = null;
  private shown = false;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.RECONNECTING);
    this.scene = scene;
    this.createLayout();
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_BLACK);
    this.bg.setAlpha(BG_ALPHA);
    this.ball = this.scene.add.image(0, 0, 'safari-ball');
    this.ball.setScale(SPRITE_SCALE);
    this.text = addText(
      this.scene,
      0,
      TEXT_OFFSET_Y,
      i18next.t('etc:reconnecting'),
      50,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.add([this.bg, this.ball, this.text]);
  }

  show(): void {
    if (this.shown) return;
    this.shown = true;

    const zoom = this.scene.cameras.main.zoom;
    this.setScale(zoom > 0 ? 1 / zoom : 1);
    this.text.setText(i18next.t('etc:reconnecting'));
    this.setVisible(true);

    this.inputManager.push(this);
    this.inputManager.setBlocked(true);
    this.startRotation();
  }

  hide(): void {
    if (!this.shown) return;
    this.shown = false;

    this.stopRotation();
    this.setVisible(false);
    this.inputManager.setBlocked(false);
    this.inputManager.pop(this);
  }

  isActive(): boolean {
    return this.shown;
  }

  private startRotation(): void {
    if (this.rotateTween) return;
    this.ball.setAngle(0);
    this.rotateTween = this.scene.tweens.add({
      targets: this.ball,
      angle: 360,
      duration: ROTATION_DURATION_MS,
      repeat: -1,
      ease: 'Linear',
    });
  }

  private stopRotation(): void {
    if (this.rotateTween) {
      this.rotateTween.stop();
      this.rotateTween = null;
    }
    this.ball.setAngle(0);
  }

  destroy(fromScene?: boolean): void {
    this.stopRotation();
    if (this.shown) {
      this.inputManager.setBlocked(false);
      this.inputManager.pop(this);
      this.shown = false;
    }
    super.destroy(fromScene);
  }

  onInput(_key: string): void {}
  errorEffect(_errorMsg: string): void {}
  waitForInput(): Promise<never> {
    return new Promise(() => {});
  }
}
