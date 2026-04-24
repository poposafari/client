import type { NpcPathStep, ReactionStep } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import { TEXTCOLOR } from '@poposafari/types';
import { DIRECTION } from '../overworld.constants';
import { IOverworldBlockingRef, IOverworldMapAdapter, MovableObject } from './movable.object';

const DEFAULT_MOVING_NPC_SPEED = 2;
const BLOCKED_RETRY_INTERVAL_MS = 500;
const FACE_CHANGE_DELAY_MS = 200;

type PathRunnerState = 'idle' | 'waiting' | 'facing' | 'moving' | 'blocked';

export interface MovingNpcOptions {
  mapAdapter: IOverworldMapAdapter | null;
  blockingRefs?: IOverworldBlockingRef[];
  path?: NpcPathStep[];
  scale?: number;
  nameOffsetY?: number;
  baseSpeed?: number;
}

export class MovingNpcObject extends MovableObject {
  private path: NpcPathStep[];
  private pathIndex = 0;
  private pathState: PathRunnerState = 'idle';
  private waitStartMs = 0;
  private paused = false;
  private currentStepTilesRemaining = 0;
  private currentStepDirection: DIRECTION = DIRECTION.NONE;
  private blockedSinceMs = 0;
  private facingStartMs = 0;

  constructor(
    scene: GameScene,
    texture: string,
    tileX: number,
    tileY: number,
    name: string,
    initDirection: DIRECTION,
    options: MovingNpcOptions,
  ) {
    super(
      scene,
      options.mapAdapter,
      texture,
      tileX,
      tileY,
      { text: name, color: TEXTCOLOR.YELLOW },
      initDirection,
      {
        scale: options.scale,
        blockingRefs: options.blockingRefs,
        nameOffsetY: options.nameOffsetY ?? 100,
      },
    );
    this.setBaseSpeed(options.baseSpeed ?? DEFAULT_MOVING_NPC_SPEED);
    this.path = options.path ?? [];
  }

  reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(direction);
    return [];
  }

  getPhaseRequest(): string | null {
    return null;
  }

  lookAt(direction: DIRECTION): void {
    this.setDirectionOnly(direction);
  }

  protected oppositeDirection(direction: DIRECTION): DIRECTION {
    switch (direction) {
      case DIRECTION.UP:
        return DIRECTION.DOWN;
      case DIRECTION.DOWN:
        return DIRECTION.UP;
      case DIRECTION.LEFT:
        return DIRECTION.RIGHT;
      case DIRECTION.RIGHT:
        return DIRECTION.LEFT;
      default:
        return direction;
    }
  }

  pauseMovement(): void {
    this.paused = true;
    this.clearMovementQueue();

    if (
      this.pathState === 'facing' ||
      this.pathState === 'moving' ||
      this.pathState === 'blocked'
    ) {
      this.pathState = 'idle';
      this.currentStepTilesRemaining = 0;
    }
  }

  resumeMovement(): void {
    if (!this.paused) return;
    this.paused = false;

    if (this.pathState === 'waiting') {
      this.pathState = 'idle';
    }
  }

  setPath(path: NpcPathStep[]): void {
    this.path = path;
    this.pathIndex = 0;
    this.pathState = 'idle';
  }

  override update(delta: number): void {
    super.update(delta);
    if (this.paused) return;
    if (this.path.length === 0) return;
    this.tickPathRunner();
  }

  private tickPathRunner(): void {
    switch (this.pathState) {
      case 'idle': {
        this.waitStartMs = this.scene.time.now;
        this.pathState = 'waiting';
        return;
      }
      case 'waiting': {
        const step = this.path[this.pathIndex];
        if (!step) {
          this.pathIndex = 0;
          this.pathState = 'idle';
          return;
        }
        if (this.scene.time.now - this.waitStartMs < step.delayMs) return;
        this.currentStepDirection = step.direction;
        this.currentStepTilesRemaining = Math.max(1, Math.floor(step.tiles));
        this.onBeforeStepStart(step.direction);
        this.facingStartMs = this.scene.time.now;
        this.pathState = 'facing';
        return;
      }
      case 'facing': {
        if (this.scene.time.now - this.facingStartMs < FACE_CHANGE_DELAY_MS) return;
        this.tryPushNextTile();
        return;
      }
      case 'moving': {
        if (this.isInMotion()) return;
        if (this.currentStepTilesRemaining <= 0) {
          this.pathIndex = (this.pathIndex + 1) % this.path.length;
          this.pathState = 'idle';
          return;
        }
        this.tryPushNextTile();
        return;
      }
      case 'blocked': {
        if (this.scene.time.now - this.blockedSinceMs < BLOCKED_RETRY_INTERVAL_MS) return;
        this.blockedSinceMs = this.scene.time.now;
        this.tryPushNextTile();
        return;
      }
    }
  }

  private tryPushNextTile(): void {
    const dir = this.currentStepDirection;
    const key = this.getWalkAnimationKey(dir);
    this.ready(dir, key, 1);
    if (this.isMovementBlocking()) {
      this.pathState = 'blocked';
      this.blockedSinceMs = this.scene.time.now;
      return;
    }
    this.currentStepTilesRemaining--;
    this.pathState = 'moving';
  }

  protected getWalkAnimationKey(_direction: DIRECTION): string {
    return '';
  }

  protected onBeforeStepStart(direction: DIRECTION): void {
    this.lookAt(direction);
  }

  override startSpriteAnimation(key: string): void {
    if (!key) return;
    if (!this.scene.anims.exists(key)) return;
    super.startSpriteAnimation(key);
  }
}
