import { eventBus } from '../core/event-bus';
import { ANIMATION } from '../enums/animation';
import { AUDIO } from '../enums/audio';
import { DIRECTION } from '../enums/direction';
import { EASE } from '../enums/ease';
import { EVENT } from '../enums/event';
import { HM } from '../enums/hidden-move';
import { KEY } from '../enums/key';
import { OBJECT } from '../enums/object-type';
import { PLAYER_STATUS } from '../enums/player-status';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { Bag } from '../storage/bag';
import { OverworldInfo } from '../storage/overworld-info';
import { PlayerInfo } from '../storage/player-info';
import { playSound } from '../uis/ui';
import { BaseObject, MAP_SCALE, TILE_SIZE } from './base-object';
import { MovableObject } from './movable-object';
import { PetObject } from './pet-object';

export class PlayerObject extends MovableObject {
  private currentStatus!: PLAYER_STATUS;
  private lastStatus!: PLAYER_STATUS;
  private pet!: PetObject;
  private dummy!: BaseObject;

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap | null, nickname: string, type: OBJECT) {
    super(scene, texture, x, y, map!, nickname, type);
    this.setStatus(PLAYER_STATUS.WALK, this.getLastDirection());

    this.pet = new PetObject(scene, `pokemon_overworld${this.getPlayerData().getPet()}`, x, y - 1, map!, '');
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

  getLastStatus() {
    return this.lastStatus;
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

  setStatus(status: PLAYER_STATUS, direction: DIRECTION) {
    switch (status) {
      case PLAYER_STATUS.WALK:
        this.currentStatus = PLAYER_STATUS.WALK;
        this.setTexture(`${this.getPlayerData().getGender()}_${this.getPlayerData().getAvatar()}_movement`);
        this.setSpriteFrameNow(direction, 0, 3, 6, 9);
        break;
      case PLAYER_STATUS.RUNNING:
        if (this.currentStatus === PLAYER_STATUS.RIDE) return;
        this.currentStatus = this.currentStatus === PLAYER_STATUS.RUNNING ? PLAYER_STATUS.WALK : PLAYER_STATUS.RUNNING;
        break;
      case PLAYER_STATUS.RIDE:
        this.currentStatus = this.currentStatus === PLAYER_STATUS.RIDE ? PLAYER_STATUS.WALK : PLAYER_STATUS.RIDE;
        this.setSpriteFrameNow(direction, 0, 3, 6, 9);
        break;
      case PLAYER_STATUS.SURF:
        this.currentStatus = PLAYER_STATUS.SURF;
        this.setTexture(`surf`);
        this.setSpriteFrameNow(direction, 0, 3, 6, 9);

        break;
      case PLAYER_STATUS.TALK:
        this.lastStatus = this.currentStatus;
        this.currentStatus = PLAYER_STATUS.TALK;
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
        return this.setStatus(PLAYER_STATUS.RIDE, this.getLastDirection());
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

  jump(hm: HM) {
    if (this.isMoving() || !this.isMovementFinish()) return;
    if (hm === HM.NONE) {
      this.dummy2.setTexture(TEXTURE.BLANK);
      this.dummy2.stop();
      this.setStatus(PLAYER_STATUS.WALK, this.getLastDirection());
    }

    const direction = this.getLastDirection();
    const directionVector = new Phaser.Math.Vector2(direction === DIRECTION.LEFT ? -1 : direction === DIRECTION.RIGHT ? 1 : 0, direction === DIRECTION.UP ? -1 : direction === DIRECTION.DOWN ? 1 : 0);
    const tileSize = TILE_SIZE * MAP_SCALE;
    const sprite = this.getSprite();
    const scene = this.getScene();
    const currentPos = this.getPosition();
    const targetPos = currentPos.clone().add(directionVector.clone().scale(tileSize * 2));
    const jumpHeight = 40;
    const duration = 400;

    const startTime = scene.time.now;

    scene.tweens.add({
      targets: sprite,
      x: targetPos.x,
      duration,
      ease: EASE.LINEAR,
      onStart: () => {
        playSound(this.getScene(), AUDIO.JUMP);
      },
      onUpdate: (tween) => {
        this.spriteShadow.setVisible(false);
        const elapsed = scene.time.now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const parabolaY = -4 * jumpHeight * t * (1 - t);
        sprite.y = Phaser.Math.Interpolation.Linear([currentPos.y, targetPos.y], t) + parabolaY;
      },
      onComplete: () => {
        this.spriteShadow.setVisible(true);
        this.setTilePos(this.getTilePos().add(directionVector.clone().scale(2)));
        this.setPosition(targetPos);
        this.updateObjectData();

        if (hm === HM.SURF) {
          this.dummy.destroy();
          eventBus.emit(EVENT.POP_MODE);
          this.setStatus(PLAYER_STATUS.SURF, this.getLastDirection());
        } else {
          this.setStatus(PLAYER_STATUS.WALK, this.getLastDirection());
        }

        this.pet.setupNewPosAfterRecall(this);
      },
    });
  }

  private setSpriteFrameNow(direction: DIRECTION, upFrame: number, downFrame: number, leftFrame: number, rightFrame: number) {
    switch (direction) {
      case DIRECTION.UP:
        if (this.currentStatus === PLAYER_STATUS.SURF) this.moveSurfDeco(KEY.UP);
        this.setSpriteFrame(upFrame);
        break;
      case DIRECTION.DOWN:
        if (this.currentStatus === PLAYER_STATUS.SURF) this.moveSurfDeco(KEY.DOWN);
        this.setSpriteFrame(downFrame);
        break;
      case DIRECTION.LEFT:
        if (this.currentStatus === PLAYER_STATUS.SURF) this.moveSurfDeco(KEY.LEFT);
        this.setSpriteFrame(leftFrame);
        break;
      case DIRECTION.RIGHT:
        if (this.currentStatus === PLAYER_STATUS.SURF) this.moveSurfDeco(KEY.RIGHT);
        this.setSpriteFrame(rightFrame);
        break;
    }
  }

  startSurfAnimation() {
    const pos = this.getTilePos();
    const lastDirection = this.getLastDirection();

    let x = pos.x;
    let y = pos.y;
    let frame = 0;

    switch (lastDirection) {
      case DIRECTION.UP:
        y = y - 2;
        frame = 0;
        break;
      case DIRECTION.DOWN:
        y = y + 2;
        frame = 3;
        break;
      case DIRECTION.LEFT:
        x = x - 2;
        frame = 6;
        break;
      case DIRECTION.RIGHT:
        x = x + 2;
        frame = 9;
        break;
    }

    eventBus.emit(EVENT.PET_RECALL, this);
    this.dummy = new BaseObject(this.getScene(), `surf`, x, y, '', OBJECT.PLAYER);
    this.dummy.setSpriteFrame(frame);
    this.dummy.setScale(3.2);

    this.jump(HM.SURF);
  }
}
