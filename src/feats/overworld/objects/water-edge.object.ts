import { GameScene } from '@poposafari/scenes';
import { TEXTURE } from '@poposafari/types';

const WATER_EDGE_SCALE = 3;

export class WaterEdgeObject {
  private sprite: Phaser.GameObjects.Sprite;

  constructor(scene: GameScene, x: number, y: number, depth: number) {
    this.sprite = scene.add
      .sprite(x, y, TEXTURE.OVERWORLD_FOOTPRINT_2, 'overworld_footprint_2-0')
      .setOrigin(0.5, 1)
      .setScale(WATER_EDGE_SCALE)
      .setDepth(depth);

    if (scene.anims.exists(TEXTURE.OVERWORLD_FOOTPRINT_2)) {
      this.sprite.play(TEXTURE.OVERWORLD_FOOTPRINT_2);
    }
  }

  syncWith(x: number, y: number, depth: number): void {
    this.sprite.setPosition(x, y);
    this.sprite.setDepth(depth);
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  destroy(): void {
    if (this.sprite.active) this.sprite.destroy();
  }
}
