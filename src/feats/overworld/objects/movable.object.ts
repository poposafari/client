import { GameScene } from '@poposafari/scenes';
import {
  TILE_PIXEL,
  calcOverworldTilePos,
  directionToDelta,
  DIRECTION,
} from '../overworld.constants';
import { BaseObject, ObjectName } from './base.object';

type MovementQueue = {
  direction: DIRECTION;
  animationKey: string;
  tiles?: number;
};

export interface IOverworldMapAdapter {
  hasTileAt(tileX: number, tileY: number): boolean;
  hasBlockingTileAt(tileX: number, tileY: number): boolean;
}

export interface IOverworldBlockingRef {
  getTilePos(): { x: number; y: number };
}

export class MovableObject extends BaseObject {
  private mapAdapter: IOverworldMapAdapter | null;
  private currentDirection: DIRECTION = DIRECTION.NONE;
  private tileSizePixelsWalked = 0;
  private currentMoveTiles = 1;
  private jumpStartPixel: { x: number; y: number } | null = null;
  private movementCheck = true;
  private movementDirectionQueue: MovementQueue[] = [];
  private movementBlocking = false;
  private blockingRefs: IOverworldBlockingRef[] = [];

  protected lastDirection: DIRECTION;
  protected animStep = 0;
  protected smoothFrameNumbers: number[] = [];
  protected stopFrameNumbers: number[] = [];
  protected baseSpeed = 100;

  constructor(
    scene: GameScene,
    mapAdapter: IOverworldMapAdapter | null,
    texture: string,
    tileX: number,
    tileY: number,
    name: ObjectName,
    initDirection: DIRECTION,
    options?: { scale?: number; blockingRefs?: IOverworldBlockingRef[] },
  ) {
    super(scene, texture, tileX, tileY, name, 0, options);
    this.mapAdapter = mapAdapter ?? null;
    this.lastDirection = initDirection;
    this.blockingRefs = options?.blockingRefs ?? [];
  }

  setBlockingRefs(refs: IOverworldBlockingRef[]): void {
    this.blockingRefs = refs;
  }

  ready(direction: DIRECTION, animationKey: string, tiles = 1): void {
    const tx = this.tileX + directionToDelta(direction).dx * tiles;
    const ty = this.tileY + directionToDelta(direction).dy * tiles;
    if (this.hasBlocking(tx, ty, direction)) {
      this.lastDirection = direction;
      this.movementDirectionQueue.length = 0;
      this.movementBlocking = true;
      const frame = this.getStopFrameNumberFromDirection(this.lastDirection);
      if (frame !== undefined) this.stopSpriteAnimation(frame);
      return;
    }
    this.movementBlocking = false;
    this.movementDirectionQueue.push({ direction, animationKey, tiles });
  }

  update(delta: number): void {
    if (this.movementCheck && this.movementDirectionQueue.length === 0) {
      const frame = this.getStopFrameNumberFromDirection(this.lastDirection);
      if (frame !== undefined) this.stopSpriteAnimation(frame);
      return;
    }

    if (this.movementCheck && this.movementDirectionQueue.length > 0) {
      const temp = this.movementDirectionQueue.shift()!;
      this.currentMoveTiles = temp.tiles ?? 1;
      if (this.currentMoveTiles === 2) {
        const [sx, sy] = calcOverworldTilePos(this.tileX, this.tileY);
        this.jumpStartPixel = { x: sx, y: sy };
        this.processJump(temp.direction);
      } else {
        this.process(temp.direction, temp.animationKey);
      }
      const deltaPos = directionToDelta(this.currentDirection);
      this.setTilePos(
        this.tileX + deltaPos.dx * this.currentMoveTiles,
        this.tileY + deltaPos.dy * this.currentMoveTiles,
      );
      this.onTileMoved(this.tileX, this.tileY);
      this.movementCheck = false;
    }

    if (this.isMoving()) {
      const pixelsToMove = (this.baseSpeed * delta) / 12;
      this.moveObject(pixelsToMove);
    }
  }

  process(direction: DIRECTION, animationKey: string): void {
    if (this.isMoving()) return;
    this.currentDirection = direction;
    this.startSpriteAnimation(animationKey);
  }

  private processJump(direction: DIRECTION): void {
    if (this.isMoving()) return;
    this.currentDirection = direction;
    const frame = this.getStopFrameNumberFromDirection(direction);
    if (frame !== undefined) this.stopSpriteAnimation(frame);
  }

  processStop(): void {
    this.currentDirection = DIRECTION.NONE;
  }

  isBlockingDirection(direction: DIRECTION): boolean {
    const delta = directionToDelta(direction);
    const nextX = this.tileX + delta.dx;
    const nextY = this.tileY + delta.dy;
    return this.hasBlocking(nextX, nextY, direction);
  }

  canLandAt(tileX: number, tileY: number): boolean {
    const tx = Math.floor(tileX);
    const ty = Math.floor(tileY);
    return !this.hasBlocking(tx, ty, DIRECTION.NONE);
  }

  isMovementFinish(): boolean {
    return this.movementCheck;
  }

  isMovementBlocking(): boolean {
    return this.movementBlocking;
  }

  getLastDirection(): DIRECTION {
    return this.lastDirection;
  }

  setBaseSpeed(speed: number): void {
    this.baseSpeed = speed;
  }

  setDirectionOnly(direction: DIRECTION): void {
    this.lastDirection = direction;
    const frame = this.getStopFrameNumberFromDirection(direction);
    if (frame !== undefined) this.stopSpriteAnimation(frame);
  }

  getStopFrameNumberFromDirection(direction: DIRECTION): number | undefined {
    switch (direction) {
      case DIRECTION.UP:
        return this.stopFrameNumbers[0];
      case DIRECTION.DOWN:
        return this.stopFrameNumbers[1];
      case DIRECTION.LEFT:
        return this.stopFrameNumbers[2];
      case DIRECTION.RIGHT:
        return this.stopFrameNumbers[3];
      default:
        return undefined;
    }
  }

  protected onTileMoved(_tileX: number, _tileY: number): void {}

  private getSmoothFrameNumberFromDirection(direction: DIRECTION): number | undefined {
    switch (direction) {
      case DIRECTION.UP:
        return this.smoothFrameNumbers[0];
      case DIRECTION.DOWN:
        return this.smoothFrameNumbers[1];
      case DIRECTION.LEFT:
        return this.smoothFrameNumbers[2];
      case DIRECTION.RIGHT:
        return this.smoothFrameNumbers[3];
      default:
        return undefined;
    }
  }

  private static readonly JUMP_ARC_HEIGHT = 60;

  private moveObject(pixelsToWalkThisUpdate: number): void {
    const threshold = this.currentMoveTiles * TILE_PIXEL;
    this.tileSizePixelsWalked += pixelsToWalkThisUpdate;

    if (this.currentMoveTiles === 2 && this.jumpStartPixel) {
      const progress = Math.min(1, this.tileSizePixelsWalked / threshold);
      const [destX, destY] = calcOverworldTilePos(this.tileX, this.tileY);
      const linearX = this.jumpStartPixel.x + (destX - this.jumpStartPixel.x) * progress;
      const linearY = this.jumpStartPixel.y + (destY - this.jumpStartPixel.y) * progress;
      const arcY = -MovableObject.JUMP_ARC_HEIGHT * Math.sin(Math.PI * progress);
      this.setPosition(linearX, linearY + arcY);
    } else {
      const delta = directionToDelta(this.currentDirection);
      const currentPos = this.getSpritePos();
      const newX = currentPos.x + delta.dx * pixelsToWalkThisUpdate;
      const newY = currentPos.y + delta.dy * pixelsToWalkThisUpdate;
      this.setPosition(newX, newY);
    }

    if (this.tileSizePixelsWalked >= threshold) {
      const [px, py] = calcOverworldTilePos(this.tileX, this.tileY);
      this.setPosition(px, py);
      this.tileSizePixelsWalked = 0;
      this.currentMoveTiles = 1;
      this.jumpStartPixel = null;
      this.movementCheck = true;
      this.processStop();
      this.setSpriteDepth(this.tileY);
      this.animStep++;
    } else {
      this.lastDirection = this.currentDirection;
    }
  }

  private hasBlocking(tileX: number, tileY: number, _direction: DIRECTION): boolean {
    if (this.hasNoTile(tileX, tileY)) return true;
    if (this.hasBlockingTile(tileX, tileY)) return true;
    if (this.hasBlockingRef(tileX, tileY)) return true;
    return false;
  }

  private hasNoTile(tileX: number, tileY: number): boolean {
    if (!this.mapAdapter) return false;
    return !this.mapAdapter.hasTileAt(Math.floor(tileX), Math.floor(tileY));
  }

  private hasBlockingTile(tileX: number, tileY: number): boolean {
    if (!this.mapAdapter) return false;
    return this.mapAdapter.hasBlockingTileAt(Math.floor(tileX), Math.floor(tileY));
  }

  private hasBlockingRef(tileX: number, tileY: number): boolean {
    const tx = Math.floor(tileX);
    const ty = Math.floor(tileY);
    return this.blockingRefs.some((o) => {
      const p = o.getTilePos();
      return p.x === tx && p.y === ty;
    });
  }

  private isMoving(): boolean {
    return this.currentDirection !== DIRECTION.NONE;
  }
}
