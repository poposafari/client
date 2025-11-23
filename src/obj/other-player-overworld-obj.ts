import { DIRECTION, OBJECT, PLAYER_STATUS, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { PlayerGender } from '../types';
import { MovableOverworldObj } from './movable-overworld-obj';
import { OtherPlayerPetOverworldObj } from './other-player-pet-overworld-obj';

export class OtherPlayerOverworldObj extends MovableOverworldObj {
  private pet: OtherPlayerPetOverworldObj | null;
  private gender: PlayerGender;
  private avatar: number;
  private currentStatus!: PLAYER_STATUS;
  private lastStatus!: PLAYER_STATUS;

  private readonly spriteScale: number = 3;
  private currentAutoMove: Promise<boolean> | null = null;
  private autoMoveCancelled: boolean = false;
  private lastPositionTimestamp: number = 0;

  constructor(
    scene: InGameScene,
    map: Phaser.Tilemaps.Tilemap | null,
    gender: PlayerGender,
    avatar: number,
    pet: string | null,
    x: number,
    y: number,
    name: string = '',
    obj: OBJECT,
    direction: DIRECTION,
  ) {
    const texture = `${gender}_${avatar}_movement`;

    super(scene, map, texture, x, y, name, obj, direction);
    this.pet = new OtherPlayerPetOverworldObj(scene, map, pet, x, y);
    this.gender = gender;
    this.avatar = avatar;
    this.lastStatus = PLAYER_STATUS.WALK;
    this.currentStatus = PLAYER_STATUS.WALK;
    this.setMovement(PLAYER_STATUS.WALK);
    this.setSpriteScale(this.spriteScale);
  }

  update(delta: number) {
    super.update(delta);
    this.pet?.update(delta);
  }

  destroy(): void {
    if (this.currentAutoMove) {
      this.autoMoveCancelled = true;
      this.currentAutoMove = null;
    }

    super.destroy();
    this.pet?.destroy();
    this.pet = null;
  }

  setMovement(newStatus: PLAYER_STATUS) {
    let smoothFrames = [0, 3, 6, 9];
    let stopFrames = [0, 3, 6, 9];
    let speed = 0;

    this.lastStatus = this.currentStatus;
    this.currentStatus = newStatus;

    switch (this.currentStatus) {
      case PLAYER_STATUS.WALK:
        speed = 2;
        break;
      case PLAYER_STATUS.RUNNING:
        smoothFrames = [12, 15, 18, 21];
        speed = 4;
        break;
      case PLAYER_STATUS.RIDE:
        speed = 8;
        break;
      case PLAYER_STATUS.SURF:
        speed = 4;
        break;
    }

    this.smoothFrameNumbers = smoothFrames;
    this.stopFrameNumbers = stopFrames;
    this.baseSpeed = speed;
  }

  getPet() {
    return this.pet;
  }

  async jump(duration: number = 400, jumpHeight: number = 40): Promise<void> {
    const directionVector = new Phaser.Math.Vector2(
      this.lastDirection === DIRECTION.LEFT ? -1 : this.lastDirection === DIRECTION.RIGHT ? 1 : 0,
      this.lastDirection === DIRECTION.UP ? -1 : this.lastDirection === DIRECTION.DOWN ? 1 : 0,
    );
    const targetTilePos = this.getTilePos().add(directionVector.scale(2));
    const currentPos = this.getSpritePos();
    const [targetX, targetY] = this.calcOverworldTilePos(targetTilePos.x, targetTilePos.y);
    const targetVec = new Phaser.Math.Vector2(targetX, targetY);

    return new Promise((resolve) => {
      this.getScene().tweens.add({
        targets: [this.getSprite(), this.getShadow()],
        x: targetVec.x,
        duration,
        ease: 'Linear',
        onStart: () => {},
        onUpdate: (tween) => {
          const t = tween.progress;
          const parabolaY = -4 * jumpHeight * t * (1 - t);
          this.getSprite().y = Phaser.Math.Interpolation.Linear([currentPos.y, targetVec.y], t) + parabolaY;
        },
        onComplete: () => {
          this.setSpriteVisible(true);
          this.setTilePos(targetTilePos);
          this.setPosition(targetVec);
          resolve();
        },
      });
    });
  }

  move(str: 'up' | 'down' | 'left' | 'right') {
    const direction = this.getDirectionFromString(str);
    const animationKey = this.getAnimationKey(direction);

    if (animationKey) {
      this.ready(direction, animationKey);
      this.pet?.move(this);
    }
  }

  getCurrentStatus() {
    return this.currentStatus;
  }

  async autoMoveTo(tileX: number, tileY: number, playerType: PLAYER_STATUS, timestamp?: number): Promise<boolean> {
    if (timestamp && timestamp < this.lastPositionTimestamp) {
      return false;
    }
    if (timestamp) {
      this.lastPositionTimestamp = timestamp;
    }

    const targetTilePos = new Phaser.Math.Vector2(tileX, tileY);
    if (this.getTilePos().equals(targetTilePos)) {
      return true;
    }

    if (this.currentAutoMove) {
      this.autoMoveCancelled = true;
      try {
        await this.currentAutoMove;
      } catch {}
      this.autoMoveCancelled = false;
    }

    this.setMovement(playerType);

    this.currentAutoMove = this.executeAutoMove(tileX, tileY);
    const result = await this.currentAutoMove;
    this.currentAutoMove = null;

    return result;
  }

  private async executeAutoMove(tileX: number, tileY: number): Promise<boolean> {
    const targetTilePos = new Phaser.Math.Vector2(tileX, tileY);
    const path = this.buildStraightPath(targetTilePos);

    if (!path || path.length === 0) {
      this.setTilePos(targetTilePos);
      const [targetX, targetY] = this.calcOverworldTilePos(targetTilePos.x, targetTilePos.y);
      this.setPosition(new Phaser.Math.Vector2(targetX, targetY));
      return false;
    }

    const stepDuration = 2000;
    let success = true;

    try {
      for (const direction of path) {
        if (this.autoMoveCancelled) {
          success = false;
          break;
        }

        const ready = await this.waitForMovementState(true, stepDuration);
        if (!ready || this.autoMoveCancelled) {
          success = false;
          break;
        }

        const animationKey = this.getAnimationKey(direction);
        if (!animationKey) {
          success = false;
          break;
        }

        this.ready(direction, animationKey);

        if (this.currentStatus === PLAYER_STATUS.SURF) {
          const avatarSurfAnimationKey = this.getAvatarSurfAnimationType(direction);
          this.setVisibleDummy(true);
          this.setDummyOffsetY(this.getTilePos().x, this.getTilePos().y, -40);
          this.setDummy(TEXTURE.NONE, avatarSurfAnimationKey!, 0, 30, 3);
        } else {
          this.setVisibleDummy(false);
        }

        this.pet?.move(this);

        const started = await this.waitForMovementState(false, stepDuration);
        if (!started || this.autoMoveCancelled) {
          success = false;
          break;
        }

        const finished = await this.waitForMovementState(true, stepDuration);
        if (!finished || this.autoMoveCancelled) {
          success = false;
          break;
        }
      }

      return success;
    } catch (error) {
      console.error(`[OtherPlayerOverworldObj] AutoMove error: ${error}`);
      return false;
    }
  }

  private buildStraightPath(targetTilePos: Phaser.Math.Vector2): DIRECTION[] | null {
    const start = this.getTilePos().clone();
    const path: DIRECTION[] = [];
    const cursor = start.clone();

    const deltaX = targetTilePos.x - cursor.x;
    const horizontalDirection = deltaX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    for (let i = 0; i < Math.abs(deltaX); i++) {
      cursor.add(this.getDirectionVector(horizontalDirection));
      path.push(horizontalDirection);
    }

    const deltaY = targetTilePos.y - cursor.y;
    const verticalDirection = deltaY > 0 ? DIRECTION.DOWN : DIRECTION.UP;
    for (let i = 0; i < Math.abs(deltaY); i++) {
      cursor.add(this.getDirectionVector(verticalDirection));
      path.push(verticalDirection);
    }

    if (!cursor.equals(targetTilePos)) {
      return null;
    }

    return path;
  }

  private getDirectionVector(direction: DIRECTION): Phaser.Math.Vector2 {
    switch (direction) {
      case DIRECTION.UP:
        return new Phaser.Math.Vector2(0, -1);
      case DIRECTION.DOWN:
        return new Phaser.Math.Vector2(0, 1);
      case DIRECTION.LEFT:
        return new Phaser.Math.Vector2(-1, 0);
      case DIRECTION.RIGHT:
        return new Phaser.Math.Vector2(1, 0);
      default:
        return new Phaser.Math.Vector2(0, 0);
    }
  }

  private waitForMovementState(expectFinished: boolean, timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const scene = this.getScene();
      const step = 16;
      let elapsed = 0;

      const checkState = () => {
        if (this.autoMoveCancelled) {
          resolve(false);
          return;
        }

        if (this.isMovementFinish() === expectFinished) {
          resolve(true);
          return;
        }

        if (elapsed >= timeout) {
          resolve(false);
          return;
        }

        elapsed += step;
        scene.time.delayedCall(step, checkState);
      };

      checkState();
    });
  }

  isAutoMoving(): boolean {
    return this.currentAutoMove !== null;
  }

  private getAnimationKey(direction: DIRECTION) {
    switch (this.currentStatus) {
      case PLAYER_STATUS.WALK:
        return this.getWalkAnimationType(direction);
      case PLAYER_STATUS.RUNNING:
        return this.getRunAnimationType(direction);
      case PLAYER_STATUS.RIDE:
        return this.getRideAnimationType(direction);
      case PLAYER_STATUS.SURF:
        return this.getSurfAnimationType(direction);
    }
  }

  private getWalkAnimationType(direction: DIRECTION) {
    if (this.step >= 2) this.step = 0;

    const animationKey = `${this.gender}_${this.avatar}_movement_walk_`;

    switch (direction) {
      case DIRECTION.UP:
        if (this.step == 0) return animationKey + 'up_1';
        if (this.step == 1) return animationKey + 'up_2';
        break;
      case DIRECTION.DOWN:
        if (this.step == 0) return animationKey + 'down_1';
        if (this.step == 1) return animationKey + 'down_2';
        break;
      case DIRECTION.LEFT:
        if (this.step == 0) return animationKey + 'left_1';
        if (this.step == 1) return animationKey + 'left_2';
        break;
      case DIRECTION.RIGHT:
        if (this.step == 0) return animationKey + 'right_1';
        if (this.step == 1) return animationKey + 'right_2';
        break;
    }
    return undefined;
  }

  private getRunAnimationType(direction: DIRECTION) {
    if (this.step >= 3) this.step = 0;

    const animationKey = `${this.gender}_${this.avatar}_movement_run_`;

    switch (direction) {
      case DIRECTION.UP:
        if (this.step == 0) return animationKey + 'up_1';
        if (this.step == 1) return animationKey + 'up_2';
        if (this.step == 2) return animationKey + 'up_3';
        break;
      case DIRECTION.DOWN:
        if (this.step == 0) return animationKey + 'down_1';
        if (this.step == 1) return animationKey + 'down_2';
        if (this.step == 2) return animationKey + 'down_3';
        break;
      case DIRECTION.LEFT:
        if (this.step == 0) return animationKey + 'left_1';
        if (this.step == 1) return animationKey + 'left_2';
        if (this.step == 2) return animationKey + 'left_3';
        break;
      case DIRECTION.RIGHT:
        if (this.step == 0) return animationKey + 'right_1';
        if (this.step == 1) return animationKey + 'right_2';
        if (this.step == 2) return animationKey + 'right_3';
        break;
    }
    return undefined;
  }

  private getRideAnimationType(direction: DIRECTION) {
    if (this.step >= 5) this.step = 0;

    const animationKey = `${this.gender}_${this.avatar}_ride_`;

    switch (direction) {
      case DIRECTION.UP:
        if (this.step == 0) return animationKey + 'up_1';
        if (this.step == 1) return animationKey + 'up_2';
        if (this.step == 2) return animationKey + 'up_3';
        if (this.step == 3) return animationKey + 'up_4';
        if (this.step == 4) return animationKey + 'up_5';
        if (this.step == 5) return animationKey + 'up_6';
        break;
      case DIRECTION.DOWN:
        if (this.step == 0) return animationKey + 'down_1';
        if (this.step == 1) return animationKey + 'down_2';
        if (this.step == 2) return animationKey + 'down_3';
        if (this.step == 3) return animationKey + 'down_4';
        if (this.step == 4) return animationKey + 'down_5';
        if (this.step == 5) return animationKey + 'down_6';
        break;
      case DIRECTION.LEFT:
        if (this.step == 0) return animationKey + 'left_1';
        if (this.step == 1) return animationKey + 'left_2';
        if (this.step == 2) return animationKey + 'left_3';
        if (this.step == 3) return animationKey + 'left_4';
        if (this.step == 4) return animationKey + 'left_5';
        if (this.step == 5) return animationKey + 'left_6';
        break;
      case DIRECTION.RIGHT:
        if (this.step == 0) return animationKey + 'right_1';
        if (this.step == 1) return animationKey + 'right_2';
        if (this.step == 2) return animationKey + 'right_3';
        if (this.step == 3) return animationKey + 'right_4';
        if (this.step == 4) return animationKey + 'right_5';
        if (this.step == 5) return animationKey + 'right_6';
        break;
    }
    return undefined;
  }

  private getSurfAnimationType(direction: DIRECTION) {
    const animationKey = `surf_`;

    switch (direction) {
      case DIRECTION.UP:
        return animationKey + 'up';
      case DIRECTION.DOWN:
        return animationKey + 'down';
      case DIRECTION.LEFT:
        return animationKey + 'left';
      case DIRECTION.RIGHT:
        return animationKey + 'right';
    }
  }

  private getAvatarSurfAnimationType(direction: DIRECTION) {
    const animationKey = `${this.gender}_${this.avatar}_surf_`;

    switch (direction) {
      case DIRECTION.UP:
        return animationKey + 'up';
      case DIRECTION.DOWN:
        return animationKey + 'down';
      case DIRECTION.LEFT:
        return animationKey + 'left';
      case DIRECTION.RIGHT:
        return animationKey + 'right';
    }
  }

  updatePosition(x: number, y: number, movement: 'walk' | 'running' | 'ride' | 'surf', timestamp?: number): void {
    const status = this.getStatusFromString(movement);
    this.autoMoveTo(x, y, status, timestamp).catch((error) => {
      console.error(`[OtherPlayerOverworldObj] updatePosition error: ${error}`);
    });
  }

  changeFacing(facing: 'up' | 'down' | 'left' | 'right'): void {
    const direction = this.getDirectionFromString(facing);

    this.lastDirection = direction;

    const stopFrameNumber = this.getStopFrameNumberFromDirection(direction);
    if (stopFrameNumber !== undefined) {
      this.stopSpriteAnimation(stopFrameNumber);
    }
  }

  private getDirectionFromString(direction: string): DIRECTION {
    switch (direction) {
      case 'up':
        return DIRECTION.UP;
      case 'down':
        return DIRECTION.DOWN;
      case 'left':
        return DIRECTION.LEFT;
      case 'right':
        return DIRECTION.RIGHT;
      default:
        return DIRECTION.DOWN;
    }
  }

  private getStatusFromString(movement: 'walk' | 'running' | 'surf' | 'ride' | 'jump'): PLAYER_STATUS {
    switch (movement) {
      case 'walk':
        return PLAYER_STATUS.WALK;
      case 'running':
        return PLAYER_STATUS.RUNNING;
      case 'surf':
        return PLAYER_STATUS.SURF;
      case 'ride':
        return PLAYER_STATUS.RIDE;
      case 'jump':
        return PLAYER_STATUS.JUMP;
      default:
        return PLAYER_STATUS.WALK;
    }
  }
}
