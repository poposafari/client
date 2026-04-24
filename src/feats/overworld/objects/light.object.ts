import { GameScene } from '@poposafari/scenes';
import { TEXTCOLOR, TEXTURE } from '@poposafari/types';
import { BaseObject } from './base.object';

const LIGHT_ALPHA_MIN_RANGE: readonly [number, number] = [0.4, 0.55];
const LIGHT_ALPHA_MAX_RANGE: readonly [number, number] = [0.65, 0.85];
const LIGHT_PULSE_DURATION_RANGE_MS: readonly [number, number] = [400, 900];

export interface LightObjectOptions {
  offsetX?: number;
  offsetY?: number;
}

export class LightObject extends BaseObject {
  private alphaTween: Phaser.Tweens.Tween | null = null;
  private offsetX = 0;
  private offsetY = 0;

  constructor(scene: GameScene, tileX: number, tileY: number, options?: LightObjectOptions) {
    super(scene, TEXTURE.LIGHT, tileX, tileY, { text: '', color: TEXTCOLOR.WHITE, raw: true }, 0);

    this.offsetX = options?.offsetX ?? 0;
    this.offsetY = options?.offsetY ?? 0;

    const minAlpha = Phaser.Math.FloatBetween(LIGHT_ALPHA_MIN_RANGE[0], LIGHT_ALPHA_MIN_RANGE[1]);
    const maxAlpha = Phaser.Math.FloatBetween(LIGHT_ALPHA_MAX_RANGE[0], LIGHT_ALPHA_MAX_RANGE[1]);
    const duration = Phaser.Math.Between(
      LIGHT_PULSE_DURATION_RANGE_MS[0],
      LIGHT_PULSE_DURATION_RANGE_MS[1],
    );

    this.shadow.setVisible(false);
    this.name.setVisible(false);
    this.sprite.setAlpha(minAlpha);
    this.sprite.setScale(4);

    this.refreshPosition();

    this.alphaTween = scene.tweens.add({
      targets: this.sprite,
      alpha: { from: minAlpha, to: maxAlpha },
      duration,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    // 같은 타이밍에 생성된 light들이 동기화되어 보이지 않도록 진행도를 랜덤 오프셋한다.
    this.alphaTween.seek(Math.random() * duration * 2);
  }

  setOffset(offsetX: number, offsetY: number): void {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.refreshPosition();
  }

  override refreshPosition(): void {
    super.refreshPosition();
    const ox = this.offsetX ?? 0;
    const oy = this.offsetY ?? 0;
    if (ox !== 0 || oy !== 0) {
      this.sprite.x += ox;
      this.sprite.y += oy;
    }
  }

  override destroy(): void {
    if (this.alphaTween) {
      this.alphaTween.stop();
      this.alphaTween = null;
    }
    super.destroy();
  }
}
