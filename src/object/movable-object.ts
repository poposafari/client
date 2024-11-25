import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { BaseObject, MAP_SCALE } from './base-object';

const Vector2 = Phaser.Math.Vector2;

export class MovableObject extends BaseObject {
  private step: number = 0;
  private stepSpeed: number = 2;
  private currentDirection: DIRECTION = DIRECTION.NONE;
  private lastDirection: DIRECTION = DIRECTION.DOWN;
  private tileSizePixelsWalked: number = 0;
  private pixelsToWalkThisUpdate: number = 0;
  private smoothFrameNumbers: number[] = [];

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
    return this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= 32 * MAP_SCALE;
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

  private isMoving() {
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
    console.log(this.smoothFrameNumbers);
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
}
