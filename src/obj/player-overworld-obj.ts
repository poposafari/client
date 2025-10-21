import { PlayerItem } from './player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { PlayerGender } from '../types';
import { MovableOverworldObj } from './movable-overworld-obj';
import { PetOverworldObj } from './pet-overworld-obj';
import { PlayerPokemon } from './player-pokemon';
import { findEventTile, runFadeEffect, playEffectSound } from '../uis/ui';
import { OverworldObj } from './overworld-obj';
import { DoorOverworldObj } from './door-overworld-obj';
import { ShopCheckoutOverworldObj } from './shop-checkout-overworld-obj';
import { eventBus } from '../core/event-bus';
import { PostCheckoutOverworldObj } from './post-checkout-overworld-obj';
import { AUDIO, DIRECTION, EASE, EVENT, MODE, OBJECT, PLAYER_STATUS, TEXTURE } from '../enums';
import { GM } from '../core/game-manager';
import { NpcOverworldObj } from './npc-overworld-obj';
import { WildOverworldObj } from './wild-overworld-obj';
import { GroundItemOverworldObj } from './ground-item-overworld-obj';

export class PlayerOverworldObj extends MovableOverworldObj {
  private currentStatus!: PLAYER_STATUS;
  private lastStatus!: PLAYER_STATUS;
  private gender: PlayerGender;
  private avatar: number;
  private pet: PetOverworldObj | null;
  private dummyObj!: OverworldObj | null;
  private runningToggle!: boolean;

  isEvent: boolean = false;

  private readonly spriteScale: number = 3;

  constructor(
    scene: InGameScene,
    map: Phaser.Tilemaps.Tilemap | null,
    gender: PlayerGender,
    avatar: number,
    pet: PlayerPokemon,
    x: number,
    y: number,
    name: string = '',
    obj: OBJECT,
    direction: DIRECTION,
  ) {
    const texture = `${gender}_${avatar}_movement`;

    super(scene, map, texture, x, y, name, obj, direction);

    this.gender = gender;
    this.avatar = avatar;

    this.pet = new PetOverworldObj(scene, map, pet, x, y);

    this.currentStatus = PLAYER_STATUS.WALK;
    this.setMovement(PLAYER_STATUS.WALK);
    GM.setRunningToggle(false);
    eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
    this.setSpriteScale(this.spriteScale);
    this.movePetBehind();
  }

  setRunningToggle() {
    this.runningToggle = !this.runningToggle;
    GM.setRunningToggle(this.runningToggle);
  }

  setMovement(newStatus: PLAYER_STATUS) {
    if (this.currentStatus === PLAYER_STATUS.WALK) {
      if (newStatus === PLAYER_STATUS.RUNNING) this.currentStatus = PLAYER_STATUS.RUNNING;
      if (newStatus === PLAYER_STATUS.RIDE) {
        this.currentStatus = PLAYER_STATUS.RIDE;
        this.recallPet();
      }
      if (newStatus === PLAYER_STATUS.SURF) {
        this.currentStatus = PLAYER_STATUS.SURF;
        this.setVisibleDummy(true);
      }
    } else if (this.currentStatus === PLAYER_STATUS.RUNNING) {
      if (newStatus === PLAYER_STATUS.RUNNING) this.currentStatus = PLAYER_STATUS.WALK;
      if (newStatus === PLAYER_STATUS.WALK) this.currentStatus = PLAYER_STATUS.WALK;
      if (newStatus === PLAYER_STATUS.RIDE) {
        this.currentStatus = PLAYER_STATUS.RIDE;
        this.recallPet();
      }
      if (newStatus === PLAYER_STATUS.SURF) {
        this.currentStatus = PLAYER_STATUS.SURF;
        this.setVisibleDummy(true);
      }
    } else if (this.currentStatus === PLAYER_STATUS.RIDE) {
      if (newStatus === PLAYER_STATUS.RIDE) {
        this.currentStatus = this.runningToggle ? PLAYER_STATUS.RUNNING : PLAYER_STATUS.WALK;
        this.callPet();
      } else if (newStatus === PLAYER_STATUS.SURF) {
        this.currentStatus = PLAYER_STATUS.SURF;
      }
    } else if (this.currentStatus === PLAYER_STATUS.SURF) {
      if (newStatus === PLAYER_STATUS.SURF) {
        this.currentStatus = this.runningToggle ? PLAYER_STATUS.RUNNING : PLAYER_STATUS.WALK;
        this.setVisibleDummy(false);
        this.callPet();
      }
    }

    let smoothFrames = [0, 3, 6, 9];
    let stopFrames = [0, 3, 6, 9];
    let speed = 0;
    this.step = 0;

    switch (this.currentStatus) {
      case PLAYER_STATUS.WALK:
        speed = 2;
        break;
      case PLAYER_STATUS.RUNNING:
        smoothFrames = [12, 15, 18, 21];
        speed = 4;
        break;
      case PLAYER_STATUS.RIDE:
        speed = 6;
        break;
      case PLAYER_STATUS.SURF:
        speed = 4;
        break;
    }

    this.smoothFrameNumbers = smoothFrames;
    this.stopFrameNumbers = stopFrames;
    this.baseSpeed = speed;

    this.updateAppearance();
  }

  move(direction: DIRECTION) {
    const animationKey = this.getAnimationKey(direction);

    if (this.currentStatus === PLAYER_STATUS.SURF) {
      const avatarSurfAnimationKey = this.getAvatarSurfAnimationType(direction);
      this.setVisibleDummy(true);
      this.setDummyOffsetY(this.getTilePos().x, this.getTilePos().y, -40);
      this.setDummy(TEXTURE.NONE, avatarSurfAnimationKey!, 0, 30, 3);
    } else {
      this.setVisibleDummy(false);
    }

    if (animationKey) {
      this.ready(direction, animationKey);
      this.pet?.move(this);
    }
  }

  changeDirectionOnly(direction: DIRECTION) {
    this.lastDirection = direction;
    const stopFrameNumber = this.getStopFrameNumberFromDirection(direction);
    if (stopFrameNumber !== undefined) {
      this.stopSpriteAnimation(stopFrameNumber);
    }
  }

  getCurrentStatus() {
    return this.currentStatus;
  }

  getPet() {
    return this.pet;
  }

  readyUseItem(item: PlayerItem) {
    if (!this.isMovementFinish()) return;
    this.useItem(item);
  }

  useItem(item: PlayerItem) {
    switch (item.getKey()) {
      case '046':
        return this.setMovement(PLAYER_STATUS.RIDE);
    }
  }

  getEvent(): 'surf' | ShopCheckoutOverworldObj | PostCheckoutOverworldObj | NpcOverworldObj | WildOverworldObj | GroundItemOverworldObj | null {
    const tiles = this.getTileInfo(this.lastDirection);
    const obj = this.getObjectInFront(this.lastDirection);
    const event = findEventTile(tiles);

    if (obj instanceof ShopCheckoutOverworldObj) return obj;
    if (obj instanceof PostCheckoutOverworldObj) return obj;
    if (obj instanceof NpcOverworldObj) return obj;
    if (obj instanceof WildOverworldObj) return obj;
    if (obj instanceof GroundItemOverworldObj) return obj;
    if (event === 'surf' && GM.findSkillsInParty('surf')) return 'surf';

    return null;
  }

  setIsEvent(onoff: boolean) {
    this.isEvent = onoff;
  }

  movePetBehind() {
    this.pet?.teleportBehind(this);
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

  setSurf() {
    this.dummyObj?.destroy();
  }

  async createDummyObjSprite(type: 'surf'): Promise<void> {
    let scale = 1;
    let stopFrames = [0, 3, 6, 9];
    let targetFrame = 0;

    if (type === 'surf') {
      scale = 3;
      stopFrames = [0, 3, 6, 9];
    }

    switch (this.lastDirection) {
      case DIRECTION.UP:
        targetFrame = 0;
        break;
      case DIRECTION.DOWN:
        targetFrame = 1;
        break;
      case DIRECTION.LEFT:
        targetFrame = 2;
        break;
      case DIRECTION.RIGHT:
        targetFrame = 3;
        break;
    }

    return new Promise((resolve) => {
      const directionVector = new Phaser.Math.Vector2(
        this.lastDirection === DIRECTION.LEFT ? -1 : this.lastDirection === DIRECTION.RIGHT ? 1 : 0,
        this.lastDirection === DIRECTION.UP ? -1 : this.lastDirection === DIRECTION.DOWN ? 1 : 0,
      );
      const targetTilePos = this.getTilePos().add(directionVector.scale(2));

      this.dummyObj = new OverworldObj(this.getScene(), `surf`, targetTilePos.x, targetTilePos.y, '', OBJECT.NONE);
      this.dummyObj.setSpriteScale(scale);
      this.dummyObj.stopSpriteAnimation(stopFrames[targetFrame]);
      resolve();
    });
  }

  callPet() {
    this.pet?.call();
  }

  recallPet() {
    this.pet?.recall();
  }

  async isDoorInFront(direction: DIRECTION) {
    const door = this.getObjectInFront(direction);
    if (this.getObjType() === OBJECT.PLAYER && door instanceof DoorOverworldObj) {
      this.setIsEvent(true);
      await this.openDoor(direction, door);
    }
  }

  async openDoor(direction: DIRECTION, door: DoorOverworldObj): Promise<void> {
    return new Promise(async (resolve) => {
      const goal = door.getGoal();
      const lastLocation = GM.getUserData()?.location;
      const currentLocation = goal.location;

      this.setIsEvent(true);
      if (door.getTexture() !== TEXTURE.BLANK) {
        if (door.getTexture() === 'door_1' || door.getTexture() === 'door_7') {
          playEffectSound(this.getScene(), AUDIO.DOOR_ENTER_1);
        } else {
          playEffectSound(this.getScene(), AUDIO.DOOR_ENTER_2);
        }
        await door.reaction();
        await this.forceMoveForward(direction, 200);
      } else {
        playEffectSound(this.getScene(), AUDIO.DOOR_ENTER_0);
      }
      runFadeEffect(this.getScene(), 800, 'in');
      GM.updateUserData({ location: currentLocation, lastLocation: lastLocation, x: goal.x, y: goal.y });
      GM.changeMode(MODE.OVERWORLD);

      this.setIsEvent(false);
      resolve();
    });
  }

  async forceMoveForward(currentDirection: DIRECTION, duration: number): Promise<void> {
    if (!this.isMovementFinish()) {
      return;
    }

    this.setIsEvent(true);

    const direction = currentDirection;
    const animationKey = this.getWalkAnimationType(direction);

    if (!animationKey) {
      console.error('Could not determine walk animation key.');
      this.setIsEvent(false);
      return;
    }

    const directionVector = new Phaser.Math.Vector2(direction === DIRECTION.LEFT ? -1 : direction === DIRECTION.RIGHT ? 1 : 0, direction === DIRECTION.UP ? -1 : direction === DIRECTION.DOWN ? 1 : 0);
    const targetTilePos = this.getTilePos().add(directionVector);
    const [targetX, targetY] = this.calcOverworldTilePos(targetTilePos.x, targetTilePos.y);
    const targetVec = new Phaser.Math.Vector2(targetX, targetY);

    return new Promise((resolve) => {
      this.getScene().tweens.add({
        targets: [this.getSprite(), this.getShadow()],
        onStart: () => {
          this.startSpriteAnimation(animationKey);
        },
        x: targetVec.x,
        y: targetVec.y,
        duration: duration,
        ease: EASE.LINEAR,
        onComplete: () => {
          this.setTilePos(targetTilePos);
          this.setPosition(targetVec);
          this.stopSpriteAnimation(this.getStopFrameNumberFromDirection(direction)!);
          this.setSpriteVisible(false);
          resolve();
        },
      });
    });
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

  private updateAppearance() {
    if (this.currentStatus === PLAYER_STATUS.SURF) {
      const dummyTextureKey = this.getBaseDummyText('surf');
      const avatarSurfAnimationKey = this.getAvatarSurfAnimationType(this.lastDirection);
      this.setVisibleDummy(true);
      this.setDummyOffsetY(this.getTilePos().x, this.getTilePos().y, -40);
      this.setDummy(TEXTURE.NONE, avatarSurfAnimationKey!, 0, 30, 3);
    }

    const newTextureKey = this.getBaseTextureKey();
    const stopFrameIndex = this.getStopFrameNumberFromDirection(this.lastDirection)!;

    this.getSprite().setTexture(newTextureKey);
    this.stopSpriteAnimation(stopFrameIndex);
  }

  async forceSetTexture(status: PLAYER_STATUS): Promise<void> {
    return new Promise((resolve) => {
      const newTextureKey = this.getBaseTextureKey(status);
      const stopFrameIndex = this.getStopFrameNumberFromDirection(this.lastDirection)!;
      this.getSprite().setTexture(newTextureKey);
      this.stopSpriteAnimation(stopFrameIndex);
      resolve();
    });
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

  private getBaseDummyText(dummy: 'surf') {
    const prefix = `${this.gender}_${this.avatar}_`;

    switch (dummy) {
      case 'surf':
        return `${prefix}surf`;
      default:
        return `${prefix}surf`;
    }
  }
}
