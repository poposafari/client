import { GameScene } from '@poposafari/scenes';
import { calcOverworldTilePos } from '../overworld.constants';
import { BaseObject } from './base.object';
import { TEXTCOLOR, TEXTSTYLE } from '@poposafari/types';

/** 웹소켓 등으로 받은 다른 플레이어. BaseObject + moveToTile tween으로만 이동 */
export class OtherPlayerObject extends BaseObject {
  private moveTween: Phaser.Tweens.Tween | null = null;

  /** 한 타일 이동 tween 기본 시간 (ms) */
  private static readonly DEFAULT_MOVE_DURATION_MS = 200;

  constructor(
    scene: GameScene,
    texture: string,
    tileX: number,
    tileY: number,
    options?: { scale?: number },
  ) {
    super(scene, texture, tileX, tileY, { text: '', color: TEXTCOLOR.WHITE }, 100, options);
  }

  /**
   * 목표 타일로 스프라이트를 tween 이동.
   * 이미 이동 중이면 기존 tween을 중단하고 새 목표로 이동.
   */
  moveToTile(tileX: number, tileY: number, durationMs?: number): void {
    this.stopMoveTween();

    const targetX = Math.floor(tileX);
    const targetY = Math.floor(tileY);
    const [px, py] = calcOverworldTilePos(targetX, targetY);
    const duration = durationMs ?? OtherPlayerObject.DEFAULT_MOVE_DURATION_MS;

    this.moveTween = this.scene.tweens.add({
      targets: this.sprite,
      x: px,
      y: py,
      duration,
      ease: Phaser.Math.Easing.Linear,
      onComplete: () => {
        this.setTilePos(targetX, targetY);
        this.setSpriteDepth(targetY);
        this.moveTween = null;
      },
    });
  }

  private stopMoveTween(): void {
    if (this.moveTween) {
      this.moveTween.stop();
      this.moveTween = null;
    }
  }

  override destroy(): void {
    this.stopMoveTween();
    super.destroy();
  }
}
