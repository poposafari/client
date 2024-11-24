import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { BaseObject, MAP_SCALE } from './base-object';

const Vector2 = Phaser.Math.Vector2;

export class MovableObject extends BaseObject {
  private step: number = 0;
  private currentDirection: DIRECTION = DIRECTION.NONE;
  private lastDirection: DIRECTION = DIRECTION.DOWN;
  private tileSizePixelsWalked: number = 0;
  private pixelsToWalkThisUpdate: number = 0;

  private movementDirection: {
    [key in DIRECTION]?: Phaser.Math.Vector2;
  } = {
    [DIRECTION.UP]: Vector2.UP,
    [DIRECTION.DOWN]: Vector2.DOWN,
    [DIRECTION.LEFT]: Vector2.LEFT,
    [DIRECTION.RIGHT]: Vector2.RIGHT,
  };

  constructor(scene: InGameScene, texture: TEXTURE, x: number, y: number) {
    super(scene, texture, x, y);
  }

  process(direction: DIRECTION) {
    if (this.isMoving()) return;
    this.pixelsToWalkThisUpdate = this.getMoveSpeed(false);
    this.currentDirection = direction;
    this.startAnmation(this.getMoveType(this.currentDirection)!);
    this.setTilePos(this.getTilePos().add(this.movementDirection[this.currentDirection]!));
  }

  processStop() {
    this.currentDirection = DIRECTION.NONE;
  }

  private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number): boolean {
    return this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= 32 * MAP_SCALE;
  }

  private getMoveType(direction: DIRECTION) {
    if (this.step === 2) {
      this.step = 0;
    }

    if (direction === DIRECTION.UP) {
      if (this.step === 0) return ANIMATION.PLAYER_MOVEMENT_WALK_UP_1;
      if (this.step === 1) return ANIMATION.PLAYER_MOVEMENT_WALK_UP_2;
    }
    if (direction === DIRECTION.DOWN) {
      if (this.step === 0) return ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_1;
      if (this.step === 1) return ANIMATION.PLAYER_MOVEMENT_WALK_DOWN_2;
    }
    if (direction === DIRECTION.LEFT) {
      if (this.step === 0) return ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_1;
      if (this.step === 1) return ANIMATION.PLAYER_MOVEMENT_WALK_LEFT_2;
    }
    if (direction === DIRECTION.RIGHT) {
      if (this.step === 0) return ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_1;
      if (this.step === 1) return ANIMATION.PLAYER_MOVEMENT_WALK_RIGHT_2;
    }
  }

  private moveSprite(pixelsToWalkThisUpdate: number) {
    const playerDirectionVector = this.movementDirection[this.lastDirection]!.clone();
    const playerMovementDistance = playerDirectionVector.multiply(new Vector2(pixelsToWalkThisUpdate));
    const newPlayerPos = this.getPosition().add(playerMovementDistance);
    this.setPosition(newPlayerPos);

    this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
    this.tileSizePixelsWalked %= 32 * MAP_SCALE;

    this.lastDirection = this.currentDirection;
  }

  update(delta: number) {
    if (!this.isMoving()) return;

    if (this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate * MAP_SCALE)) {
      this.moveSprite(this.pixelsToWalkThisUpdate * MAP_SCALE);
      this.processStop();
      this.step++;
      this.stopAnmation(this.getStopFrameNumber(this.lastDirection)!);
    } else {
      this.moveSprite(this.pixelsToWalkThisUpdate * MAP_SCALE);
    }
  }

  private getMoveSpeed(type: boolean) {
    return type ? 4 : 2;
  }

  private isMoving() {
    return this.currentDirection != DIRECTION.NONE;
  }

  private getStopFrameNumber(direction: DIRECTION) {
    switch (direction) {
      case DIRECTION.UP:
        return 0;
      case DIRECTION.DOWN:
        return 3;
      case DIRECTION.LEFT:
        return 6;
      case DIRECTION.RIGHT:
        return 9;
    }
  }
}
