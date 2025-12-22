import { ANIMATION, OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldObj } from './overworld-obj';

export class GrassOverworldObj extends OverworldObj {
  private onAnimationCompleteCallback?: () => void;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, name: string = '', objType: OBJECT) {
    super(scene, texture, x, y, name, OBJECT.GRASS);

    this.getSprite().setScale(1.4);
  }

  startGrassAnimation(tileY: number, onComplete?: () => void): void {
    this.onAnimationCompleteCallback = onComplete;
    const sprite = this.getSprite();
    sprite.play({ key: ANIMATION.OVERWORLD_SHADOW_GRASS, repeat: 0, frameRate: 20 });

    sprite.once('animationcomplete', () => {
      sprite.anims.stop();
      const anim = sprite.anims.currentAnim;
      if (anim) {
        const lastFrameIndex = anim.frames.length - 1;
        sprite.setFrame(anim.frames[lastFrameIndex].frame.name);
      }
    });
  }
}
