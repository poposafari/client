import { GameScene } from '@poposafari/scenes';
import { ANIMATION, TEXTURE } from '@poposafari/types';
import { addSprite } from '@poposafari/utils';
import { calcOverworldTilePos } from '../overworld.constants';
import { BaseObject } from './base.object';

export type GrassVariant = 1 | 2;
const GRASS_SCALE = 3.8;

export class GrassObject extends BaseObject {
  private readonly variant: GrassVariant;
  private spriteBack: Phaser.GameObjects.Sprite | null = null;
  private backAnimKey: string | null = null;
  private backAnimStarted = true;

  constructor(
    scene: GameScene,
    tileX: number,
    tileY: number,
    variant: GrassVariant,
    options?: { deferBackAnim?: boolean },
  ) {
    const texture = variant === 1 ? TEXTURE.OVERWORLD_GRASS_1 : TEXTURE.OVERWORLD_GRASS_2;
    super(scene, texture, tileX, tileY, { text: '', raw: true }, 0, { scale: GRASS_SCALE });
    this.variant = variant;

    this.shadow.setVisible(false);
    this.name.setVisible(false);
    this.sprite.setDepth(this.tileY + 0.2);

    const animKey = variant === 1 ? ANIMATION.OVERWORLD_GRASS_1 : ANIMATION.OVERWORLD_GRASS_2;
    this.sprite.setTexture(texture, `${texture}-0`);
    if (scene.anims.exists(animKey)) {
      this.sprite.play(animKey);
    }

    const backTexture = variant === 1 ? TEXTURE.OVERWORLD_GRASS_1_B : TEXTURE.OVERWORLD_GRASS_2_B;
    const backAnim = variant === 1 ? ANIMATION.OVERWORLD_GRASS_1_B : ANIMATION.OVERWORLD_GRASS_2_B;
    const [px, py] = calcOverworldTilePos(this.tileX, this.tileY);
    this.spriteBack = addSprite(scene, backTexture, `${backTexture}-0`, tileX, tileY)
      .setOrigin(0.5, 1)
      .setScale(GRASS_SCALE);
    this.spriteBack.setPosition(px, py);
    this.spriteBack.setDepth(this.tileY - 0.2);
    this.backAnimKey = backAnim;
    if (options?.deferBackAnim) {
      this.backAnimStarted = false;
    } else if (scene.anims.exists(backAnim)) {
      this.spriteBack.play(backAnim);
    }
  }

  getVariant(): GrassVariant {
    return this.variant;
  }

  getBackSprite(): Phaser.GameObjects.Sprite | null {
    return this.spriteBack;
  }

  startBackAnim(): void {
    if (this.backAnimStarted) return;
    const back = this.spriteBack;
    const key = this.backAnimKey;
    if (!back || !back.active || !key) return;
    if (!back.scene.anims.exists(key)) return;
    back.play(key);
    this.backAnimStarted = true;
  }

  destroyAfterAnim(): void {
    const s = this.sprite;
    if (!s.active) return;
    s.setDepth(this.tileY - 0.2);
    if (s.anims && s.anims.isPlaying) {
      s.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (this.sprite.active) this.destroy();
      });
      return;
    }
    this.destroy();
  }

  override destroy(): void {
    if (this.spriteBack) {
      this.spriteBack.destroy();
      this.spriteBack = null;
    }
    super.destroy();
  }
}
