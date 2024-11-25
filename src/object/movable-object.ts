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

  process() {
    if (this.isMoving()) return;

    const temp = this.movementDirectionQueue.shift();

    this.pixelsToWalkThisUpdate = this.stepSpeed;
    this.currentDirection = temp!.direction;
    this.startAnmation(temp!.animationKey);
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

    // 목표 위치와 실제 좌표 정렬
    this.setPosition(newPosition);
    this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
    this.tileSizePixelsWalked %= 32 * MAP_SCALE;

    // 타일 경계에 도달 시 정확히 정렬
    if (this.tileSizePixelsWalked >= TILE_SIZE * MAP_SCALE) {
      const targetTilePos = this.getTilePos();
      this.setPosition(targetTilePos.scale(TILE_SIZE * MAP_SCALE));
      this.tileSizePixelsWalked = 0; // 경계 조정
    }

    this.lastDirection = this.currentDirection;

    console.log('Current Tile Pos: ', this.getTilePos());
  }

  ready(direction: DIRECTION, animationKey: ANIMATION) {
    this.movementDirectionQueue.push({ direction: direction, animationKey: animationKey });
  }

  update(delta: number) {
    if (this.movementFinish && this.movementDirectionQueue.length > 0) {
      this.process();
    }
    if (this.isMoving()) this.moveObject();
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
