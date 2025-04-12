import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { OBJECT } from '../enums/object-type';
import { PLAYER_STATUS } from '../enums/player-status';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { Bag } from '../storage/bag';
import { OverworldInfo } from '../storage/overworld-info';
import { PlayerInfo } from '../storage/player-info';
import { MovableObject } from './movable-object';
import { PetObject } from './pet-object';

export class PlayerObject extends MovableObject {
  private currentStatus!: PLAYER_STATUS;
  private pet!: PetObject;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap | null, nickname: string, overworldInfo: OverworldInfo, type: OBJECT) {
    super(scene, texture, x, y, map!, nickname, overworldInfo, type);
    this.setStatus(PLAYER_STATUS.WALK);

    this.pet = new PetObject(scene, `pokemon_overworld${this.getPlayerData().getPet()}`, x, y - 1, map!, '', this.overworldInfo);
    const petSprite = this.pet.getSprite();
    this.pet.setVisible(this.getPlayerData().getPet() ? true : false);
    petSprite.setScale(1.5);
  }

  getPet() {
    return this.pet;
  }

  move(key: KEY) {
    const animationKey = this.getAnimation(key);
    this.movementStop = false;

    switch (key) {
      case KEY.UP:
        this.ready(DIRECTION.UP, animationKey!);
        this.pet.move(this);
        break;
      case KEY.DOWN:
        this.ready(DIRECTION.DOWN, animationKey!);
        this.pet.move(this);
        break;
      case KEY.LEFT:
        this.ready(DIRECTION.LEFT, animationKey!);
        this.pet.move(this);
        break;
      case KEY.RIGHT:
        this.ready(DIRECTION.RIGHT, animationKey!);
        this.pet.move(this);
        break;
    }

    this.moveSurfDeco(key);
  }

  isPlayerStop() {
    return this.getMovementDirectionQueue().length === 0 ? true : false;
  }

  private getAnimation(key: KEY) {
    switch (this.currentStatus) {
      case PLAYER_STATUS.WALK:
        return this.getWalkAnimationType(key);
      case PLAYER_STATUS.RUNNING:
        return this.getRunAnimationType(key);
      case PLAYER_STATUS.RIDE:
        return this.getRideAnimationType(key);
      case PLAYER_STATUS.SURF:
        return this.getSurfAnimationType(key);
    }
  }

  private getWalkAnimationType(key: KEY) {
    if (this.getStep() >= 2) this.resetStep();

    const step = this.getStep();
    const animationKey = `${this.getPlayerData().getGender()}_${this.getPlayerData().getAvatar()}_movement_walk_`;

    switch (key) {
      case KEY.UP:
        if (step == 0) return animationKey + 'up_1';
        if (step == 1) return animationKey + 'up_2';
      case KEY.DOWN:
        if (step == 0) return animationKey + 'down_1';
        if (step == 1) return animationKey + 'down_2';
      case KEY.LEFT:
        if (step == 0) return animationKey + 'left_1';
        if (step == 1) return animationKey + 'left_2';
      case KEY.RIGHT:
        if (step == 0) return animationKey + 'right_1';
        if (step == 1) return animationKey + 'right_2';
    }
  }

  private getRunAnimationType(key: KEY) {
    if (this.getStep() >= 3) this.resetStep();

    const step = this.getStep();
    const animationKey = `${this.getPlayerData().getGender()}_${this.getPlayerData().getAvatar()}_movement_run_`;

    switch (key) {
      case KEY.UP:
        if (step == 0) return animationKey + 'up_1';
        if (step == 1) return animationKey + 'up_2';
        if (step == 2) return animationKey + 'up_3';
      case KEY.DOWN:
        if (step == 0) return animationKey + 'down_1';
        if (step == 1) return animationKey + 'down_2';
        if (step == 2) return animationKey + 'down_3';
      case KEY.LEFT:
        if (step == 0) return animationKey + 'left_1';
        if (step == 1) return animationKey + 'left_2';
        if (step == 2) return animationKey + 'left_3';
      case KEY.RIGHT:
        if (step == 0) return animationKey + 'right_1';
        if (step == 1) return animationKey + 'right_2';
        if (step == 2) return animationKey + 'right_3';
    }
  }

  private getRideAnimationType(key: KEY) {
    if (this.getStep() >= 5) this.resetStep();

    const step = this.getStep();
    const animationKey = `${this.getPlayerData().getGender()}_${this.getPlayerData().getAvatar()}_ride_`;

    switch (key) {
      case KEY.UP:
        if (step == 0) return animationKey + 'up_1';
        if (step == 1) return animationKey + 'up_2';
        if (step == 2) return animationKey + 'up_3';
        if (step == 3) return animationKey + 'up_4';
        if (step == 4) return animationKey + 'up_5';
        if (step == 5) return animationKey + 'up_6';
      case KEY.DOWN:
        if (step == 0) return animationKey + 'down_1';
        if (step == 1) return animationKey + 'down_2';
        if (step == 2) return animationKey + 'down_3';
        if (step == 3) return animationKey + 'down_4';
        if (step == 4) return animationKey + 'down_5';
        if (step == 5) return animationKey + 'down_6';
      case KEY.LEFT:
        if (step == 0) return animationKey + 'left_1';
        if (step == 1) return animationKey + 'left_2';
        if (step == 2) return animationKey + 'left_3';
        if (step == 3) return animationKey + 'left_4';
        if (step == 4) return animationKey + 'left_5';
        if (step == 5) return animationKey + 'left_6';
      case KEY.RIGHT:
        if (step == 0) return animationKey + 'right_1';
        if (step == 1) return animationKey + 'right_2';
        if (step == 2) return animationKey + 'right_3';
        if (step == 3) return animationKey + 'right_4';
        if (step == 4) return animationKey + 'right_5';
        if (step == 5) return animationKey + 'right_6';
    }
  }

  private getSurfAnimationType(key: KEY) {
    const animationKey = `surf_`;

    switch (key) {
      case KEY.UP:
        return animationKey + 'up';
      case KEY.DOWN:
        return animationKey + 'down';
      case KEY.LEFT:
        return animationKey + 'left';
      case KEY.RIGHT:
        return animationKey + 'right';
    }
  }

  setStatus(status: PLAYER_STATUS) {
    switch (status) {
      case PLAYER_STATUS.WALK:
        this.currentStatus = PLAYER_STATUS.WALK;
        break;
      case PLAYER_STATUS.RUNNING:
        if (this.currentStatus === PLAYER_STATUS.RIDE) return;
        this.currentStatus = this.currentStatus === PLAYER_STATUS.RUNNING ? PLAYER_STATUS.WALK : PLAYER_STATUS.RUNNING;
        break;
      case PLAYER_STATUS.RIDE:
        this.currentStatus = this.currentStatus === PLAYER_STATUS.RIDE ? PLAYER_STATUS.WALK : PLAYER_STATUS.RIDE;
        break;
      case PLAYER_STATUS.SURF:
        this.currentStatus = PLAYER_STATUS.SURF;
        break;
    }
    this.setMovement();
  }

  getStatus() {
    return this.currentStatus;
  }

  setMovement() {
    /*
    walk = 2
    run = 4
    ride = 8
    surf = 4
    */

    let smoothFrames;
    let speed;

    this.resetStep();
    switch (this.currentStatus) {
      case PLAYER_STATUS.WALK:
        smoothFrames = [0, 3, 6, 9];
        speed = 2;
        break;
      case PLAYER_STATUS.RUNNING:
        smoothFrames = [12, 15, 18, 21];
        speed = 4;
        break;
      case PLAYER_STATUS.RIDE:
        smoothFrames = [0, 3, 6, 9];
        speed = 8;
        break;
      case PLAYER_STATUS.SURF:
        smoothFrames = [0, 3, 6, 9];
        speed = 4;
        break;
    }

    this.setSmoothFrames(smoothFrames!);
    this.setSpeed(speed!);
  }

  readyItem(target: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    if (!this.isMovementFinish()) return;
    const item = PlayerInfo.getInstance().getItemSlot()[target - 1];

    if (!item) return;
    this.useItem(item);
  }

  useItem(item: string) {
    switch (item) {
      case '046':
        return this.setStatus(PLAYER_STATUS.RIDE);
    }
  }

  private moveSurfDeco(key: KEY) {
    if (this.currentStatus !== PLAYER_STATUS.SURF) return;

    let animationKey = `${this.getPlayerData().getGender()}_${this.getPlayerData().getAvatar()}_surf_`;

    switch (key) {
      case KEY.UP:
        animationKey += 'up';
        break;
      case KEY.DOWN:
        animationKey += 'down';
        break;
      case KEY.LEFT:
        animationKey += 'left';
        break;
      case KEY.RIGHT:
        animationKey += 'right';
        break;
    }

    this.dummy2.setScale(3);
    this.dummy2.play(animationKey);
    this.setDeccoSpritePosition('y', -20);
  }

  private getPlayerData() {
    return PlayerInfo.getInstance();
  }
}
