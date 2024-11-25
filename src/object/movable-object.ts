import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { BaseObject, MAP_SCALE, TILE_SIZE } from './base-object';

const Vector2 = Phaser.Math.Vector2;

interface MovementQueue {
  direction: DIRECTION;
  animationKey: ANIMATION;
}

export class MovableObject extends BaseObject {
  private step: number = 0;
  private stepSpeed: number = 2;
  private currentDirection: DIRECTION = DIRECTION.NONE;
  private lastDirection: DIRECTION = DIRECTION.DOWN;
  private tileSizePixelsWalked: number = 0;
  private pixelsToWalkThisUpdate: number = 0;
  private smoothFrameNumbers: number[] = [];
  private movementFinish: boolean = true;
  protected movementStop: boolean = true;
  private movementDirectionQueue: Array<MovementQueue> = [];

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

  process(direction: DIRECTION, animationKey: ANIMATION) {
    if (this.isMoving()) return;

    this.pixelsToWalkThisUpdate = this.stepSpeed;
    this.currentDirection = direction;
    this.startAnmation(animationKey);
    this.setTilePos(this.getTilePos().add(this.movementDirection[this.currentDirection]!));
  }

  processStop() {
    this.currentDirection = DIRECTION.NONE;
  }

  private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number): boolean {
    return this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= TILE_SIZE * MAP_SCALE;
  }

  private moveSprite(pixelsToWalkThisUpdate: number) {
    const directionVector = this.movementDirection[this.currentDirection]!.clone();
    const movement = directionVector.scale(pixelsToWalkThisUpdate);
    const currentPos = this.getPosition();
    const newPosition = currentPos.add(movement);

    this.setPosition(newPosition);
    this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
    this.tileSizePixelsWalked %= 32 * MAP_SCALE;

    if (this.tileSizePixelsWalked >= TILE_SIZE * MAP_SCALE) {
      const targetTilePos = this.getTilePos();
      this.setPosition(targetTilePos.scale(TILE_SIZE * MAP_SCALE));
      this.tileSizePixelsWalked = 0;
    }

    this.lastDirection = this.currentDirection;

    // console.log('Current Tile Pos: ', this.getTilePos());
  }

  ready(direction: DIRECTION, animationKey: ANIMATION) {
    this.movementDirectionQueue.push({ direction: direction, animationKey: animationKey });
  }

  update(delta: number) {
    if (this.movementStop) return;

    if (this.movementFinish && this.movementDirectionQueue.length === 0) {
      this.standStop(this.lastDirection);
    }

    if (this.movementFinish && this.movementDirectionQueue.length > 0) {
      const temp = this.movementDirectionQueue.shift();
      this.process(temp!.direction, temp!.animationKey);
    }
    if (this.isMoving()) this.moveObject();
  }

  private standStop(direction: DIRECTION) {
    let frameNumber = 0;

    switch (direction) {
      case DIRECTION.UP:
        frameNumber = 0;
        break;
      case DIRECTION.DOWN:
        frameNumber = 3;
        break;
      case DIRECTION.LEFT:
        frameNumber = 6;
        break;
      case DIRECTION.RIGHT:
        frameNumber = 9;
        break;
    }

    this.stopAnmation(frameNumber);
  }

  private moveObject() {
    if (this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate * MAP_SCALE)) {
      this.moveSprite(this.pixelsToWalkThisUpdate * MAP_SCALE);
      this.processStop();
      this.stopAnmation(this.getStopFrameNumber(this.lastDirection)!);
      this.step++;
      this.movementFinish = true;
    } else {
      this.moveSprite(this.pixelsToWalkThisUpdate * MAP_SCALE);
      this.movementFinish = false;
    }
  }

  isMoving() {
    return this.currentDirection != DIRECTION.NONE;
  }

  private getStopFrameNumber(direction: DIRECTION) {
    let idx = 0;
    switch (direction) {
      case DIRECTION.UP:
        idx = 0;
        break;
      case DIRECTION.DOWN:
        idx = 1;
        break;
      case DIRECTION.LEFT:
        idx = 2;
        break;
      case DIRECTION.RIGHT:
        idx = 3;
        break;
    }
    return this.smoothFrameNumbers[idx];
  }

  setSmoothFrames(frames: number[]) {
    this.smoothFrameNumbers = frames;
  }

  setSpeed(speed: number) {
    this.stepSpeed = speed;
  }

  getStep() {
    return this.step;
  }

  resetStep() {
    this.step = 0;
  }

  isMovementFinish() {
    return this.movementFinish;
  }
}
