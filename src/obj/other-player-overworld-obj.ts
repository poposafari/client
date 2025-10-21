import { DIRECTION, OBJECT, PLAYER_STATUS, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { PlayerGender, MovementPlayer } from '../types';
import { matchPlayerStatusToDirection } from '../utils/string-util';
import { MovableOverworldObj } from './movable-overworld-obj';
import { OtherPlayerPetOverworldObj } from './other-player-pet-overworld-obj';
import { PetOverworldObj } from './pet-overworld-obj';
import { PlayerPokemon } from './player-pokemon';

export class OtherPlayerOverworldObj extends MovableOverworldObj {
  private pet: OtherPlayerPetOverworldObj | null;
  private gender: PlayerGender;
  private avatar: number;
  private currentStatus!: PLAYER_STATUS;
  private lastStatus!: PLAYER_STATUS;

  private readonly spriteScale: number = 3;

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
      case DIRECTION.DOWN:
        if (this.step == 0) return animationKey + 'down_1';
        if (this.step == 1) return animationKey + 'down_2';
      case DIRECTION.LEFT:
        if (this.step == 0) return animationKey + 'left_1';
        if (this.step == 1) return animationKey + 'left_2';
      case DIRECTION.RIGHT:
        if (this.step == 0) return animationKey + 'right_1';
        if (this.step == 1) return animationKey + 'right_2';
    }
  }

  private getRunAnimationType(direction: DIRECTION) {
    if (this.step >= 3) this.step = 0;

    const animationKey = `${this.gender}_${this.avatar}_movement_run_`;

    switch (direction) {
      case DIRECTION.UP:
        if (this.step == 0) return animationKey + 'up_1';
        if (this.step == 1) return animationKey + 'up_2';
        if (this.step == 2) return animationKey + 'up_3';
      case DIRECTION.DOWN:
        if (this.step == 0) return animationKey + 'down_1';
        if (this.step == 1) return animationKey + 'down_2';
        if (this.step == 2) return animationKey + 'down_3';
      case DIRECTION.LEFT:
        if (this.step == 0) return animationKey + 'left_1';
        if (this.step == 1) return animationKey + 'left_2';
        if (this.step == 2) return animationKey + 'left_3';
      case DIRECTION.RIGHT:
        if (this.step == 0) return animationKey + 'right_1';
        if (this.step == 1) return animationKey + 'right_2';
        if (this.step == 2) return animationKey + 'right_3';
    }
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
      case DIRECTION.DOWN:
        if (this.step == 0) return animationKey + 'down_1';
        if (this.step == 1) return animationKey + 'down_2';
        if (this.step == 2) return animationKey + 'down_3';
        if (this.step == 3) return animationKey + 'down_4';
        if (this.step == 4) return animationKey + 'down_5';
        if (this.step == 5) return animationKey + 'down_6';
      case DIRECTION.LEFT:
        if (this.step == 0) return animationKey + 'left_1';
        if (this.step == 1) return animationKey + 'left_2';
        if (this.step == 2) return animationKey + 'left_3';
        if (this.step == 3) return animationKey + 'left_4';
        if (this.step == 4) return animationKey + 'left_5';
        if (this.step == 5) return animationKey + 'left_6';
      case DIRECTION.RIGHT:
        if (this.step == 0) return animationKey + 'right_1';
        if (this.step == 1) return animationKey + 'right_2';
        if (this.step == 2) return animationKey + 'right_3';
        if (this.step == 3) return animationKey + 'right_4';
        if (this.step == 4) return animationKey + 'right_5';
        if (this.step == 5) return animationKey + 'right_6';
    }
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

  updateMovement(movementData: MovementPlayer): void {
    const direction = this.getDirectionFromString(movementData.direction);
    this.lastDirection = direction;
    const status = this.getStatusFromString(movementData.movement as 'walk' | 'running' | 'surf' | 'ride' | 'jump');
    this.setMovement(status);

    const animationKey = this.getAnimationKey(direction);
    if (animationKey) {
      this.ready(direction, animationKey);
      this.pet?.move(this);
    }
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
    }

    return PLAYER_STATUS.JUMP;
  }

  private getBaseTextureKey(status?: PLAYER_STATUS): string {
    const targetStatus = status ? status : this.currentStatus;

    const prefix = `${this.gender}_${this.avatar}_`;
    switch (targetStatus) {
      case PLAYER_STATUS.WALK:
      case PLAYER_STATUS.RUNNING:
        return `${prefix}movement`;
      case PLAYER_STATUS.RIDE:
        return `${prefix}ride`;
      case PLAYER_STATUS.SURF:
        return TEXTURE.SURF;
      default:
        return `${prefix}movement`;
    }
  }
}
