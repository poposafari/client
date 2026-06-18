import i18next from 'i18next';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, TEXTSHADOW, TEXTSTYLE } from '@poposafari/types';
import { addText } from '@poposafari/utils';
import { BaseUi } from './base.ui';

const SHOW_DELAY_MS = 200;
const SPRITE_SCALE = 4;
const ROTATION_DURATION_MS = 800;
const TEXT_OFFSET_Y = 100;

export class ApiLoadingIndicatorUi extends BaseUi {
  scene: GameScene;

  private ball!: Phaser.GameObjects.Image;
  private text!: GText;
  private rotateTween: Phaser.Tweens.Tween | null = null;
  private activeCount = 0;
  private inputBlocked = false;
  private showTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.API);
    this.scene = scene;
    this.createLayout();
  }

  createLayout(): void {
    this.ball = this.scene.add.image(0, 0, 'safari-ball');
    this.ball.setScale(SPRITE_SCALE);
    this.text = addText(
      this.scene,
      0,
      TEXT_OFFSET_Y,
      i18next.t('etc:loading'),
      50,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.add([this.ball, this.text]);
  }

  /** 요청 시작 — 입력 즉시 차단, 시각 표시는 debounce */
  start(): void {
    this.activeCount++;
    if (this.activeCount === 1) {
      if (!this.inputBlocked) {
        this.inputManager.push(this);
        this.inputBlocked = true;
      }

      if (!this.showTimer) {
        this.showTimer = this.scene.time.delayedCall(SHOW_DELAY_MS, () => {
          this.showTimer = null;
          if (this.activeCount > 0) this.reveal();
        });
      }
    }
  }

  end(): void {
    this.activeCount = Math.max(0, this.activeCount - 1);
    if (this.activeCount === 0) {
      if (this.showTimer) {
        this.showTimer.remove();
        this.showTimer = null;
      }
      this.stopRotation();
      this.setVisible(false);
      if (this.inputBlocked) {
        this.inputManager.pop(this);
        this.inputBlocked = false;
      }
    }
  }

  private reveal(): void {
    const zoom = this.scene.cameras.main.zoom;
    this.setScale(zoom > 0 ? 1 / zoom : 1);
    this.text.setText(i18next.t('etc:loading'));
    this.setVisible(true);
    this.startRotation();
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
    if (this.showTimer) {
      this.showTimer.remove();
      this.showTimer = null;
    }
    if (this.inputBlocked) {
      this.inputManager.pop(this);
      this.inputBlocked = false;
    }
    super.destroy(fromScene);
  }

  onInput(_key: string): void {}
  errorEffect(_errorMsg: string): void {}
  waitForInput(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
