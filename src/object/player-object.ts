import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { createSpriteAnimation, getSpriteFrames } from '../ui/ui';
import { MovableObject } from './movable-object';

export class PlayerObject extends MovableObject {
  private isRunning: boolean;

  constructor(scene: InGameScene, texture: TEXTURE, x: number, y: number, map: Phaser.Tilemaps.Tilemap) {
    super(scene, texture, x, y, map);

    this.init(scene, texture);
    this.isRunning = true;
    this.setRunning();
  }

  init(scene: InGameScene, texture: TEXTURE) {
    const movementFrames = getSpriteFrames(this.getScene(), texture, ANIMATION.PLAYER_MOVEMENT);

    const walkUp = [
      [movementFrames[1], movementFrames[0]],
      [movementFrames[2], movementFrames[0]],
    ];

    const walkDown = [
      [movementFrames[4], movementFrames[3]],
      [movementFrames[5], movementFrames[3]],
    ];

    const walkLeft = [
      [movementFrames[7], movementFrames[6]],
      [movementFrames[8], movementFrames[6]],
    ];

    const walkRight = [
      [movementFrames[10], movementFrames[9]],
      [movementFrames[11], movementFrames[9]],
    ];

    const runUp = [
      [movementFrames[14], movementFrames[12]],
      [movementFrames[13], movementFrames[12]],
      [movementFrames[12], movementFrames[12]],
    ];

    const runDown = [
      [movementFrames[16], movementFrames[15]],
      [movementFrames[17], movementFrames[15]],
      [movementFrames[15], movementFrames[15]],
    ];

    const runLeft = [
      [movementFrames[19], movementFrames[18]],
      [movementFrames[20], movementFrames[18]],
      [movementFrames[18], movementFrames[18]],
    ];

    const runRight = [
      [movementFrames[22], movementFrames[21]],
      [movementFrames[23], movementFrames[21]],
      [movementFrames[21], movementFrames[21]],
    ];

    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_WALK_UP_1, walkUp[0]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_WALK_UP_2, walkUp[1]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_1, walkDown[0]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_2, walkDown[1]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_1, walkLeft[0]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_2, walkLeft[1]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_1, walkRight[0]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_2, walkRight[1]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_UP_1, runUp[0]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_UP_2, runUp[1]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_UP_3, runUp[2]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_1, runDown[0]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_2, runDown[1]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_3, runDown[2]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_1, runLeft[0]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_2, runLeft[1]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_3, runLeft[2]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_1, runRight[0]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_2, runRight[1]);
    createSpriteAnimation(scene, texture, ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_3, runRight[2]);
  }

  move(key: KEY) {
    const animationKey = this.getAnimationType(key);

    this.movementStop = false;

    switch (key) {
      case KEY.UP:
        this.ready(DIRECTION.UP, animationKey!);
        break;
      case KEY.DOWN:
        this.ready(DIRECTION.DOWN, animationKey!);
        break;
      case KEY.LEFT:
        this.ready(DIRECTION.LEFT, animationKey!);
        break;
      case KEY.RIGHT:
        this.ready(DIRECTION.RIGHT, animationKey!);
        break;
    }
  }

  private getAnimationType(key: KEY) {
    if (!this.isRunning && this.getStep() === 2) {
      this.resetStep();
    } else if (this.isRunning && this.getStep() === 3) {
      this.resetStep();
    }

    const step = this.getStep();

    switch (key) {
      case KEY.UP:
        if (!this.isRunning && step == 0) return ANIMATION.PLAYER_MOVEMENT_WALK_UP_1;
        if (!this.isRunning && step == 1) return ANIMATION.PLAYER_MOVEMENT_WALK_UP_2;
        if (this.isRunning && step == 0) return ANIMATION.PLAYER_MOVEMENT_RUN_UP_1;
        if (this.isRunning && step == 1) return ANIMATION.PLAYER_MOVEMENT_RUN_UP_2;
        if (this.isRunning && step == 2) return ANIMATION.PLAYER_MOVEMENT_RUN_UP_3;
      case KEY.DOWN:
        if (!this.isRunning && step == 0) return ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_1;
        if (!this.isRunning && step == 1) return ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_2;
        if (this.isRunning && step == 0) return ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_1;
        if (this.isRunning && step == 1) return ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_2;
        if (this.isRunning && step == 2) return ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_3;
      case KEY.LEFT:
        if (!this.isRunning && step == 0) return ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_1;
        if (!this.isRunning && step == 1) return ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_2;
        if (this.isRunning && step == 0) return ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_1;
        if (this.isRunning && step == 1) return ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_2;
        if (this.isRunning && step == 2) return ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_3;
      case KEY.RIGHT:
        if (!this.isRunning && step == 0) return ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_1;
        if (!this.isRunning && step == 1) return ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_2;
        if (this.isRunning && step == 0) return ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_1;
        if (this.isRunning && step == 1) return ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_2;
        if (this.isRunning && step == 2) return ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_3;
    }
  }

  setRunning() {
    /*
    walk = 2
    run = 4
    ride = 8 
    */

    this.resetStep();
    this.isRunning = !this.isRunning;
    this.isRunning ? this.setSmoothFrames([12, 15, 18, 21]) : this.setSmoothFrames([0, 3, 6, 9]);
    this.isRunning ? this.setSpeed(4) : this.setSpeed(2);
  }
}
