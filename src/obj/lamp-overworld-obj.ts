import { DEPTH, EASE, OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { ImmovableOverworldObj } from './immovable-overworld-obj';

export class LampOverworldObj extends ImmovableOverworldObj {
  private blinkTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string, objType: OBJECT = OBJECT.LAMP) {
    super(scene, texture, x, y, name, objType);

    this.setSpriteAdjustY(122);
    this.setSpriteDepth(DEPTH.FOREGROND + 1);
    this.setSpriteScale(4);
  }

  reaction() {
    const sprite = this.getSprite();
    if (!sprite || !sprite.active) {
      return;
    }

    this.clean();

    this.blinkTween = this.getScene().tweens.add({
      targets: sprite,
      alpha: 0.6,
      duration: 800,
      ease: EASE.LINEAR,
      yoyo: true,
      repeat: -1,
    });
  }

  clean() {
    const sprite = this.getSprite();

    if (this.blinkTween) {
      this.getScene().tweens.killTweensOf(sprite);
      this.blinkTween = null;
    }

    if (sprite && sprite.active) {
      sprite.setAlpha(1.0);
    }
  }

  getBlinkTween() {
    return this.blinkTween;
  }
}
