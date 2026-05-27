import { GameScene } from '@poposafari/scenes';
import { TEXTURE } from '@poposafari/types';
import { calcOverworldTilePos, DIRECTION } from '../overworld.constants';

const FOOTPRINT_SCALE = 3;
const FADE_IN_MS = 200;
const VISIBLE_MS = 500;
const FADE_OUT_MS = 200;

function directionToAngle(dir: DIRECTION): number {
  switch (dir) {
    case DIRECTION.DOWN:
      return 0;
    case DIRECTION.LEFT:
      return 90;
    case DIRECTION.UP:
      return 180;
    case DIRECTION.RIGHT:
      return 270;
    default:
      return 0;
  }
}

export class FootprintObject {
  private sprite: Phaser.GameObjects.Image;

  constructor(scene: GameScene, tileX: number, tileY: number, ride: boolean, direction: DIRECTION) {
    const texture = ride ? TEXTURE.OVERWORLD_FOOTPRINT_1 : TEXTURE.OVERWORLD_FOOTPRINT_0;
    const [px, py] = calcOverworldTilePos(tileX, tileY);
    const yOffset = direction === DIRECTION.LEFT || direction === DIRECTION.RIGHT ? -15 : 0;
    this.sprite = scene.add
      .image(px, py + yOffset, texture)
      .setOrigin(0.5, 1)
      .setScale(FOOTPRINT_SCALE)
      .setDepth(tileY - 0.3)
      .setAngle(directionToAngle(direction))
      .setAlpha(0);

    scene.tweens.add({
      targets: this.sprite,
      alpha: 0.8,
      duration: FADE_IN_MS,
      ease: 'Sine.easeOut',
      onComplete: () => {
        scene.time.delayedCall(VISIBLE_MS, () => {
          if (!this.sprite.active) return;
          scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: FADE_OUT_MS,
            ease: 'Sine.easeIn',
            onComplete: () => this.destroy(),
          });
        });
      },
    });
  }

  getSprite(): Phaser.GameObjects.Image {
    return this.sprite;
  }

  destroy(): void {
    if (this.sprite.active) this.sprite.destroy();
  }
}
