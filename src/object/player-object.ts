import { getItemType } from '../data/items';
import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { PLAYER_STATUS } from '../enums/player-status';
import { TEXTURE } from '../enums/texture';
import { PlayerManager } from '../managers';
import { InGameScene } from '../scenes/ingame-scene';
import { createSpriteAnimation, getSpriteFrames } from '../ui/ui';
import { MovableObject } from './movable-object';

export class PlayerObject extends MovableObject {
  private currentStatus!: PLAYER_STATUS;

  constructor(scene: InGameScene, texture: TEXTURE, x: number, y: number, map: Phaser.Tilemaps.Tilemap, nickname: string) {
    const playerManager = PlayerManager.getInstance();

    super(scene, texture, x, y, map, nickname);

    this.init(scene, texture);
    this.setStatus(PLAYER_STATUS.WALK);

    this.stopAnmation(this.getStopFrameNumber(playerManager.getLastDirection()));
  }

  init(scene: InGameScene, texture: TEXTURE) {
    const playerManager = PlayerManager.getInstance();

    const movementTexture = texture;
    const rideTexture = playerManager.getType(PLAYER_STATUS.RIDE);

    const movementFrames = getSpriteFrames(this.getScene(), movementTexture, ANIMATION.PLAYER_MOVEMENT);
    const rideFrames = getSpriteFrames(this.getScene(), rideTexture, ANIMATION.PLAYER_RIDE);

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

    const rideUp = [
      [rideFrames[1], rideFrames[0]],
      [rideFrames[2], rideFrames[0]],
    ];

    const rideDown = [
      [rideFrames[4], rideFrames[3]],
      [rideFrames[5], rideFrames[3]],
    ];

    const rideLeft = [
      [rideFrames[7], rideFrames[6]],
      [rideFrames[8], rideFrames[6]],
    ];

    const rideRight = [
      [rideFrames[10], rideFrames[9]],
      [rideFrames[11], rideFrames[9]],
    ];

    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_WALK_UP_1, walkUp[0]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_WALK_UP_2, walkUp[1]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_1, walkDown[0]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_2, walkDown[1]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_1, walkLeft[0]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_2, walkLeft[1]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_1, walkRight[0]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_2, walkRight[1]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_UP_1, runUp[0]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_UP_2, runUp[1]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_UP_3, runUp[2]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_1, runDown[0]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_2, runDown[1]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_3, runDown[2]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_1, runLeft[0]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_2, runLeft[1]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_3, runLeft[2]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_1, runRight[0]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_2, runRight[1]);
    createSpriteAnimation(scene, movementTexture, ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_3, runRight[2]);

    createSpriteAnimation(scene, rideTexture, ANIMATION.PLAYER_RIDE_UP_1, rideUp[0]);
    createSpriteAnimation(scene, rideTexture, ANIMATION.PLAYER_RIDE_UP_2, rideUp[1]);
    createSpriteAnimation(scene, rideTexture, ANIMATION.PLAYER_RIDE_DOWN_1, rideDown[0]);
    createSpriteAnimation(scene, rideTexture, ANIMATION.PLAYER_RIDE_DOWN_2, rideDown[1]);
    createSpriteAnimation(scene, rideTexture, ANIMATION.PLAYER_RIDE_LEFT_1, rideLeft[0]);
    createSpriteAnimation(scene, rideTexture, ANIMATION.PLAYER_RIDE_LEFT_2, rideLeft[1]);
    createSpriteAnimation(scene, rideTexture, ANIMATION.PLAYER_RIDE_RIGHT_1, rideRight[0]);
    createSpriteAnimation(scene, rideTexture, ANIMATION.PLAYER_RIDE_RIGHT_2, rideRight[1]);
  }

  move(key: KEY) {
    const animationKey = this.getAnimation(key);
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

  private getAnimation(key: KEY) {
    switch (this.currentStatus) {
      case PLAYER_STATUS.WALK:
        return this.getWalkAnimationType(key);
      case PLAYER_STATUS.RUNNING:
        return this.getRunAnimationType(key);
      case PLAYER_STATUS.RIDE:
        return this.getRideAnimationType(key);
    }
  }

  private getWalkAnimationType(key: KEY) {
    if (this.getStep() >= 2) this.resetStep();

    const step = this.getStep();

    switch (key) {
      case KEY.UP:
        if (step == 0) return ANIMATION.PLAYER_MOVEMENT_WALK_UP_1;
        if (step == 1) return ANIMATION.PLAYER_MOVEMENT_WALK_UP_2;
      case KEY.DOWN:
        if (step == 0) return ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_1;
        if (step == 1) return ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_2;
      case KEY.LEFT:
        if (step == 0) return ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_1;
        if (step == 1) return ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_2;
      case KEY.RIGHT:
        if (step == 0) return ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_1;
        if (step == 1) return ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_2;
    }
  }

  private getRunAnimationType(key: KEY) {
    if (this.getStep() >= 3) this.resetStep();

    const step = this.getStep();

    switch (key) {
      case KEY.UP:
        if (step == 0) return ANIMATION.PLAYER_MOVEMENT_RUN_UP_1;
        if (step == 1) return ANIMATION.PLAYER_MOVEMENT_RUN_UP_2;
        if (step == 2) return ANIMATION.PLAYER_MOVEMENT_RUN_UP_3;
      case KEY.DOWN:
        if (step == 0) return ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_1;
        if (step == 1) return ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_2;
        if (step == 2) return ANIMATION.PLAYER_MOVEMENT_RUN_DOWN_3;
      case KEY.LEFT:
        if (step == 0) return ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_1;
        if (step == 1) return ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_2;
        if (step == 2) return ANIMATION.PLAYER_MOVEMENT_RUN_LEFT_3;
      case KEY.RIGHT:
        if (step == 0) return ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_1;
        if (step == 1) return ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_2;
        if (step == 2) return ANIMATION.PLAYER_MOVEMENT_RUN_RIGHT_3;
    }
  }

  private getRideAnimationType(key: KEY) {
    if (this.getStep() >= 2) this.resetStep();

    const step = this.getStep();

    switch (key) {
      case KEY.UP:
        if (step == 0) return ANIMATION.PLAYER_RIDE_UP_1;
        if (step == 1) return ANIMATION.PLAYER_RIDE_UP_2;
      case KEY.DOWN:
        if (step == 0) return ANIMATION.PLAYER_RIDE_DOWN_1;
        if (step == 1) return ANIMATION.PLAYER_RIDE_DOWN_2;
      case KEY.LEFT:
        if (step == 0) return ANIMATION.PLAYER_RIDE_LEFT_1;
        if (step == 1) return ANIMATION.PLAYER_RIDE_LEFT_2;
      case KEY.RIGHT:
        if (step == 0) return ANIMATION.PLAYER_RIDE_RIGHT_1;
        if (step == 1) return ANIMATION.PLAYER_RIDE_RIGHT_2;
    }
  }

  setStatus(status: PLAYER_STATUS) {
    switch (status) {
      case PLAYER_STATUS.WALK:
        this.currentStatus = PLAYER_STATUS.WALK;
        break;
      case PLAYER_STATUS.RUNNING:
        if (this.currentStatus === PLAYER_STATUS.RIDE) return;
        this.currentStatus = this.currentStatus === PLAYER_STATUS.RUNNING ? PLAYER_STATUS.WALK : PLAYER_STATUS.RUNNING;
        break;
      case PLAYER_STATUS.RIDE:
        this.currentStatus = this.currentStatus === PLAYER_STATUS.RIDE ? PLAYER_STATUS.WALK : PLAYER_STATUS.RIDE;
        break;
    }
    this.setMovement();
  }

  setMovement() {
    /*
    walk = 2
    run = 4
    ride = 8 
    */

    let smoothFrames;
    let speed;

    this.resetStep();
    switch (this.currentStatus) {
      case PLAYER_STATUS.WALK:
        smoothFrames = [0, 3, 6, 9];
        speed = 2;
        break;
      case PLAYER_STATUS.RUNNING:
        smoothFrames = [12, 15, 18, 21];
        speed = 4;
        break;
      case PLAYER_STATUS.RIDE:
        smoothFrames = [0, 3, 6, 9];
        speed = 8;
        break;
    }

    this.setSmoothFrames(smoothFrames!);
    this.setSpeed(speed!);
  }

  useItem(target: number) {
    const playerManager = PlayerManager.getInstance();
    const itemSlotsInfo = playerManager.getItemSlot();
    const targetIdx = target - 1;
    let idx = 0;

    for (const item of itemSlotsInfo) {
      if (idx === targetIdx) {
        const itemType = getItemType(item.idx);
        this.useItemDetail(itemType);
      }
      idx++;
    }
  }

  useItemDetail(type: string | null) {
    switch (type) {
      case 'ride':
        this.setStatus(PLAYER_STATUS.RIDE);
        break;
    }
  }
}
