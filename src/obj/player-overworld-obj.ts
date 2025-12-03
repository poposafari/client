import { PlayerItem } from './player-item';
import { InGameScene } from '../scenes/ingame-scene';
import { PlayerGender } from '../types';
import { MovableOverworldObj, OverworldObjectCollections } from './movable-overworld-obj';
import { PetOverworldObj } from './pet-overworld-obj';
import { PlayerPokemon } from './player-pokemon';
import { findEventTile, runFadeEffect, playEffectSound } from '../uis/ui';
import { OverworldObj } from './overworld-obj';
import { DoorOverworldObj } from './door-overworld-obj';
import { Event } from '../core/manager/event-manager';
import { AUDIO, DIRECTION, EASE, EVENT, MODE, OBJECT, PLAYER_STATUS, TEXTURE } from '../enums';
import { NpcOverworldObj } from './npc-overworld-obj';
import { WildOverworldObj } from './wild-overworld-obj';
import { GroundItemOverworldObj } from './ground-item-overworld-obj';
import { SocketManager } from '../core/manager/socket-manager';
import { matchPlayerStatusToDirection } from '../utils/string-util';
import { SignOverworldObj } from './sign-overworld-obj';
import { PlayerGlobal, PlayerStorage } from '../core/storage/player-storage';
import { Game } from '../core/manager/game-manager';
import { OverworldGlobal } from '../core/storage/overworld-storage';
import { PC } from '../core/storage/pc-storage';
import { OverworldTriggerObj } from './overworld-trigger-obj';
import { OverworldHUDUi } from '../uis/overworld/overworld-hud-ui';

export class PlayerOverworldObj extends MovableOverworldObj {
  private currentStatus!: PLAYER_STATUS;
  private lastStatus!: PLAYER_STATUS;
  private gender: PlayerGender;
  private avatar: number;
  private pet: PetOverworldObj | null;
  private dummyObj!: OverworldObj | null;
  private runningToggle!: boolean;
  private playerMap: Phaser.Tilemaps.Tilemap | null;
  private tempHudUi!: OverworldHUDUi;
  private handleSetPetListener: () => void;

  isEvent: boolean = false;

  // private readonly spriteScale: number = 3;
  private readonly spriteScale: number = 2;

  constructor(
    scene: InGameScene,
    map: Phaser.Tilemaps.Tilemap | null,
    gender: PlayerGender,
    avatar: number,
    pet: PlayerPokemon | null,
    x: number,
    y: number,
    name: string = '',
    obj: OBJECT,
    direction: DIRECTION,
    hud: OverworldHUDUi,
    objectCollections?: OverworldObjectCollections,
    isAllowedRide?: boolean,
  ) {
    const texture = `${gender}_${avatar}_movement`;

    super(scene, map, texture, x, y, name, obj, direction, objectCollections);

    this.gender = gender;
    this.avatar = avatar;
    this.playerMap = map;

    this.pet = new PetOverworldObj(scene, map, pet, x, y);

    this.tempHudUi = hud;

    this.currentStatus = PLAYER_STATUS.WALK;
    this.setMovement(PlayerGlobal.getLastPlayerStatus());

    if (!isAllowedRide) {
      if (PlayerGlobal.getLastPlayerStatus() === PLAYER_STATUS.RIDE) {
        this.setMovement(PLAYER_STATUS.RIDE);
      }
    }

    Event.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, false);
    this.setSpriteScale(this.spriteScale);
    this.movePetBehind();
    this.changeDirectionOnly(PlayerGlobal.getLastDirection());

    this.handleSetPetListener = () => this.handleSetPet();
    Event.on(EVENT.SET_PET, this.handleSetPetListener);
  }

  destroy(): void {
    Event.off(EVENT.SET_PET, this.handleSetPetListener);
    if (this.pet) {
      this.pet.destroy();
      this.pet = null;
    }
    super.destroy();
  }

  async showHUDForStarter(icon: TEXTURE) {
    await this.tempHudUi.showIconsForStarter(icon);
  }

  setMovement(newStatus: PLAYER_STATUS) {
    if (this.currentStatus === PLAYER_STATUS.WALK) {
      if (newStatus === PLAYER_STATUS.RUNNING) {
        this.currentStatus = PLAYER_STATUS.RUNNING;
        PlayerGlobal.setLastPlayerStatusWalkOrRunning(this.currentStatus);
      }
      if (newStatus === PLAYER_STATUS.RIDE) {
        this.currentStatus = PLAYER_STATUS.RIDE;
        this.recallPet();
      }
      if (newStatus === PLAYER_STATUS.SURF) {
        this.currentStatus = PLAYER_STATUS.SURF;
        this.setVisibleDummy(true);
      }
    } else if (this.currentStatus === PLAYER_STATUS.RUNNING) {
      if (newStatus === PLAYER_STATUS.RUNNING) {
        this.currentStatus = PLAYER_STATUS.WALK;
        PlayerGlobal.setLastPlayerStatusWalkOrRunning(this.currentStatus);
      }
      if (newStatus === PLAYER_STATUS.WALK) {
        this.currentStatus = PLAYER_STATUS.RUNNING;
        PlayerGlobal.setLastPlayerStatusWalkOrRunning(this.currentStatus);
      }
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
        this.currentStatus = PlayerGlobal.getLastPlayerStatusWalkOrRunning();
        PlayerGlobal.setLastPlayerStatus(this.currentStatus);
        this.handlePetForStatusChange();
      } else if (newStatus === PLAYER_STATUS.SURF) {
        this.currentStatus = PLAYER_STATUS.SURF;
      }
    } else if (this.currentStatus === PLAYER_STATUS.SURF) {
      if (newStatus === PLAYER_STATUS.SURF) {
        this.currentStatus = PlayerGlobal.getLastPlayerStatusWalkOrRunning();
        this.setVisibleDummy(false);
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
      if (!this.pet) {
        this.createPetIfNeeded();
      }
      this.pet?.move(this);
    }
  }

  changeDirectionOnly(direction: DIRECTION) {
    this.lastDirection = direction;
    const stopFrameNumber = this.getStopFrameNumberFromDirection(direction);
    if (stopFrameNumber !== undefined) {
      this.stopSpriteAnimation(stopFrameNumber);

      if (this.currentStatus === PLAYER_STATUS.SURF) {
        const avatarSurfAnimationKey = this.getAvatarSurfAnimationType(direction);
        this.setVisibleDummy(true);
        this.setDummyOffsetY(this.getTilePos().x, this.getTilePos().y, -40);
        this.setDummy(TEXTURE.NONE, avatarSurfAnimationKey!, 0, 30, 3);
      }
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

  getEvent(): 'surf' | NpcOverworldObj | WildOverworldObj | GroundItemOverworldObj | SignOverworldObj | null {
    const tiles = this.getTileInfo(this.lastDirection);
    const obj = this.getObjectInFront(this.lastDirection);
    const event = findEventTile(tiles);

    if (obj instanceof NpcOverworldObj) return obj;
    if (obj instanceof WildOverworldObj) return obj;
    if (obj instanceof GroundItemOverworldObj) return obj;
    if (obj instanceof SignOverworldObj) return obj;
    if (event === 'surf' && PC.findSkillsInParty('surf')) return 'surf';

    return null;
  }

  getTriggerOnCurrentTile(): OverworldTriggerObj | null {
    const triggers = this.objectCollections?.triggers;
    if (!triggers || triggers.length === 0) return null;

    const currentTilePos = this.getTilePos();
    return (
      triggers.find((trigger) => {
        const triggerTilePos = trigger.getTilePos();
        return triggerTilePos.x === currentTilePos.x && triggerTilePos.y === currentTilePos.y;
      }) || null
    );
  }

  setIsEvent(onoff: boolean) {
    this.isEvent = onoff;
  }

  movePetBehind() {
    this.pet?.teleportBehind(this);
  }

  async autoWalkTo(tileX: number, tileY: number, timeoutPerStep: number = 2000): Promise<boolean> {
    if (!this.isMovementFinish()) return false;

    const targetTilePos = new Phaser.Math.Vector2(tileX, tileY);
    if (this.getTilePos().equals(targetTilePos)) return true;

    const path = this.buildStraightPath(targetTilePos);
    if (!path || path.length === 0) return false;

    const previousStatus = this.currentStatus;
    if (this.currentStatus !== PLAYER_STATUS.WALK) {
      this.setMovement(PLAYER_STATUS.WALK);
    }

    let success = true;

    for (const direction of path) {
      const ready = await this.waitForMovementState(true, timeoutPerStep);
      if (!ready) {
        success = false;
        break;
      }

      this.move(direction);

      if (this.isMovementBlocking()) {
        success = false;
        break;
      }

      const started = await this.waitForMovementState(false, timeoutPerStep);
      if (!started) {
        success = false;
        break;
      }

      const finished = await this.waitForMovementState(true, timeoutPerStep);
      if (!finished || this.isMovementBlocking()) {
        success = false;
        break;
      }
    }

    if (previousStatus !== PLAYER_STATUS.WALK) {
      this.setMovement(previousStatus);
    }

    return success;
  }

  canSurfOff(direction: DIRECTION): boolean {
    const directionVector = new Phaser.Math.Vector2(direction === DIRECTION.LEFT ? -1 : direction === DIRECTION.RIGHT ? 1 : 0, direction === DIRECTION.UP ? -1 : direction === DIRECTION.DOWN ? 1 : 0);
    const targetTilePos = this.getTilePos().add(directionVector.scale(2));

    if (this.hasBlocking(targetTilePos, direction)) {
      return false;
    }

    return true;
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
        onStart: () => {
          playEffectSound(this.getScene(), AUDIO.JUMP);

          SocketManager.getInstance().movementPlayer({
            x: targetVec.x,
            y: targetVec.y,
            direction: matchPlayerStatusToDirection(this.lastDirection),
            movement: 'jump',
            pet: null,
          });
        },
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
    if (this.pet) {
      this.pet.recall();
      setTimeout(() => {
        if (this.pet) {
          this.pet.destroy();
          this.pet = null;
        }
      }, 1000);
    }
  }

  private handleSetPet() {
    const petData = PC.getPet();

    if (this.currentStatus === PLAYER_STATUS.WALK || this.currentStatus === PLAYER_STATUS.RUNNING) {
      if (!this.pet && petData) {
        const [x, y] = this.calcOverworldTilePos(this.getTilePos().x, this.getTilePos().y);
        this.pet = new PetOverworldObj(this.getScene(), this.playerMap, petData, this.getTilePos().x, this.getTilePos().y);
        this.movePetBehind();
        this.pet.call();
      } else if (this.pet && petData) {
        this.pet.changePet(petData, false);
      } else if (this.pet && !petData) {
        this.recallPet();
      }
    } else if (this.currentStatus === PLAYER_STATUS.SURF || this.currentStatus === PLAYER_STATUS.RIDE) {
      if (this.pet) {
        this.pet.getSprite().setVisible(false);
        this.pet.recall();
        setTimeout(() => {
          if (this.pet) {
            this.pet.destroy();
            this.pet = null;
          }
        }, 1000);
      }
    }
  }

  handlePetForStatusChange() {
    const petData = PC.getPet();
    if (petData && !this.pet) {
      const [x, y] = this.calcOverworldTilePos(this.getTilePos().x, this.getTilePos().y);
      this.pet = new PetOverworldObj(this.getScene(), this.playerMap, petData, this.getTilePos().x, this.getTilePos().y);
      this.movePetBehind();
      this.pet.call();
    }
  }

  private createPetIfNeeded() {
    const petData = PC.getPet();
    if (petData && !this.pet && (this.currentStatus === PLAYER_STATUS.WALK || this.currentStatus === PLAYER_STATUS.RUNNING)) {
      const [x, y] = this.calcOverworldTilePos(this.getTilePos().x, this.getTilePos().y);
      this.pet = new PetOverworldObj(this.getScene(), this.playerMap, petData, this.getTilePos().x, this.getTilePos().y);
      this.movePetBehind();
      this.pet.call();
    }
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
      const lastLocation = PlayerGlobal.getData()?.location;
      const currentLocation = goal.location;

      if (door.getTexture() !== TEXTURE.BLANK) {
        if (door.getTexture() === 'door_1' || door.getTexture() === 'door_7') {
          playEffectSound(this.getScene(), AUDIO.DOOR_ENTER_1);
        } else {
          playEffectSound(this.getScene(), AUDIO.DOOR_ENTER_2);
        }
        await door.reaction();
      } else {
        playEffectSound(this.getScene(), AUDIO.DOOR_ENTER_0);
      }
      runFadeEffect(this.getScene(), 800, 'in');
      PlayerGlobal.updateData({ location: currentLocation, lastLocation: lastLocation, x: goal.x, y: goal.y });
      OverworldGlobal.setBlockingUpdate(true);
      PlayerGlobal.setLastDirection(direction);
      PlayerGlobal.setLastPlayerStatus(this.currentStatus);
      await Game.changeMode(MODE.CHECK_OVERWORLD);
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

  private buildStraightPath(targetTilePos: Phaser.Math.Vector2): DIRECTION[] | null {
    const horizontalFirst = this.buildAxisAlignedPath(targetTilePos, ['horizontal', 'vertical']);
    if (horizontalFirst) return horizontalFirst;
    return this.buildAxisAlignedPath(targetTilePos, ['vertical', 'horizontal']);
  }

  private buildAxisAlignedPath(targetTilePos: Phaser.Math.Vector2, order: Array<'horizontal' | 'vertical'>): DIRECTION[] | null {
    const start = this.getTilePos().clone();
    const path: DIRECTION[] = [];
    const cursor = start.clone();

    for (const axis of order) {
      if (axis === 'horizontal') {
        const deltaX = targetTilePos.x - cursor.x;
        if (deltaX !== 0) {
          const direction = deltaX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
          const steps = Math.abs(deltaX);
          for (let i = 0; i < steps; i++) {
            cursor.add(this.getDirectionVector(direction));
            if (this.hasBlocking(cursor.clone(), direction)) {
              return null;
            }
            path.push(direction);
          }
        }
      } else {
        const deltaY = targetTilePos.y - cursor.y;
        if (deltaY !== 0) {
          const direction = deltaY > 0 ? DIRECTION.DOWN : DIRECTION.UP;
          const steps = Math.abs(deltaY);
          for (let i = 0; i < steps; i++) {
            cursor.add(this.getDirectionVector(direction));
            if (this.hasBlocking(cursor.clone(), direction)) {
              return null;
            }
            path.push(direction);
          }
        }
      }
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
}
