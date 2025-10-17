import { OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldObj } from './overworld-obj';

type DoorGoal = {
  location: string;
  x: number;
  y: number;
};

export class DoorOverworldObj extends OverworldObj {
  private goal: DoorGoal;
  private texture: TEXTURE | string;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, offsetY: number, displayWidth: number, displayHeight: number, goal: DoorGoal) {
    super(scene, texture, x, y, '', OBJECT.DOOR);

    this.texture = texture;
    this.getSprite().setTexture(texture);

    this.getShadow().setVisible(false);
    this.getSprite().setY(this.getSprite().y + offsetY);
    this.getSprite().setDisplaySize(displayWidth, displayHeight);

    this.goal = goal;
  }

  getGoal() {
    return this.goal;
  }

  async reaction(): Promise<void> {
    return new Promise((resolve) => {
      const doorSprite = this.getSprite();

      doorSprite.once('animationcomplete', () => {
        resolve();
      });
      doorSprite.play({ key: this.texture, repeat: 0, frameRate: 10 });
    });
  }

  getTexture() {
    return this.texture;
  }
}
