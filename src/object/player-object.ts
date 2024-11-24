import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { createSpriteAnimation, getSpriteFrames } from '../ui/ui';
import { MovableObject } from './movable-object';

export class PlayerObject extends MovableObject {
  constructor(scene: InGameScene, texture: TEXTURE, x: number, y: number) {
    super(scene, texture, x, y);

    this.init(scene, texture);
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
    switch (key) {
      case KEY.UP:
        this.process(DIRECTION.UP);
        break;
      case KEY.DOWN:
        this.process(DIRECTION.DOWN);
        break;
      case KEY.LEFT:
        this.process(DIRECTION.LEFT);
        break;
      case KEY.RIGHT:
        this.process(DIRECTION.RIGHT);
        break;
    }
  }

  moveStop(key: KEY) {
    switch (key) {
      case KEY.UP:
      case KEY.DOWN:
      case KEY.LEFT:
      case KEY.RIGHT:
        this.processStop();
        break;
    }
  }
}
