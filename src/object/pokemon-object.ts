import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { OBJECT } from '../enums/object-type';
import { POKEMON_STATUS } from '../enums/pokemon-status';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { MovableObject } from './movable-object';

export class PokemonObject extends MovableObject {
  private pokedex: string;
  private readonly directions: DIRECTION[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.RIGHT, DIRECTION.LEFT];
  private readonly keys: KEY[] = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.LEFT];
  private timer?: Phaser.Time.TimerEvent;
  private againTimer?: Phaser.Time.TimerEvent;
  private status: POKEMON_STATUS;

  constructor(scene: InGameScene, texture: TEXTURE | string, pokedex: string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, nickname: string) {
    super(scene, texture, x, y, map, nickname, OBJECT.POKEMON);
    this.pokedex = pokedex;
    this.status = POKEMON_STATUS.ROAMING;
    this.setScale(1.5);
    this.setSpeed(2);
    this.setSmoothFrames([12, 0, 4, 8]);
    this.scheduleRandomMovement();
  }

  getPokedex() {
    return this.pokedex;
  }

  getStatus() {
    return this.status;
  }

  move() {
    this.movementStop = false;
  }

  capture(pokeball: number) {
    if (this.status === POKEMON_STATUS.ROAMING) {
      this.status = POKEMON_STATUS.CAPTURED;
    }

    this.checkStatus(pokeball);
  }

  checkStatus(pokeball: number) {
    switch (this.status) {
      case POKEMON_STATUS.ROAMING:
        this.setTexture(`pokemon_overworld${this.pokedex}`);
        break;
      case POKEMON_STATUS.CAPTURED:
        this.setTexture(TEXTURE.POKEBALL_GROUND);
        this.setSpriteFrame(pokeball);
        this.getSprite().stop();
        break;
    }
  }

  private getAnimation(key: KEY) {
    switch (key) {
      case KEY.UP:
        return `pokemon_overworld${this.pokedex}_up`;
      case KEY.DOWN:
        return `pokemon_overworld${this.pokedex}_down`;
      case KEY.LEFT:
        return `pokemon_overworld${this.pokedex}_left`;
      case KEY.RIGHT:
        return `pokemon_overworld${this.pokedex}_right`;
    }
  }

  scheduleRandomMovement() {
    const randomDelay = Phaser.Math.Between(1000, 6000);
    const directionIndex = this.getRandomDirection();
    const stepCount = this.getRandomStep();

    this.timer = this.getScene().time.delayedCall(randomDelay, () => {
      this.moveInSteps(directionIndex, stepCount);
    });
  }

  private moveInSteps(directionIndex: number, steps: number) {
    if (steps <= 0) {
      this.scheduleRandomMovement();
      return;
    }

    this.ready(this.directions[directionIndex], this.getAnimation(this.keys[directionIndex])!);

    this.againTimer = this.getScene().time.delayedCall(200, () => {
      this.moveInSteps(directionIndex, steps - 1);
    });
  }

  stopMovement() {
    this.movementStop = true;

    if (this.timer) {
      this.timer.remove(false);
      this.timer = undefined;
    }

    if (this.againTimer) {
      this.againTimer.remove(false);
      this.againTimer = undefined;
    }
  }

  reaction(playerDirection: DIRECTION) {
    this.stopMovement();

    switch (playerDirection) {
      case DIRECTION.DOWN:
        this.startAnmation(`pokemon_overworld${this.pokedex}_up`);
        break;
      case DIRECTION.LEFT:
        this.startAnmation(`pokemon_overworld${this.pokedex}_right`);
        break;
      case DIRECTION.RIGHT:
        this.startAnmation(`pokemon_overworld${this.pokedex}_left`);
        break;
      case DIRECTION.UP:
        this.startAnmation(`pokemon_overworld${this.pokedex}_down`);
        break;
    }

    this.dummy1.setTexture(TEXTURE.EMOTION_0);
    this.dummy1.anims.play(ANIMATION.EMOTION_0, true);

    const duration = this.dummy1.anims.currentAnim!.frames.length * (1000 / this.dummy1.anims.currentAnim!.frameRate);

    this.getScene().time.delayedCall(duration, () => {
      this.dummy1.stop();
      this.dummy1.setFrame(`emotion_0-2`);
    });

    this.getScene().time.delayedCall(2000, () => {
      this.dummy1.setTexture(TEXTURE.BLANK);
    });
  }

  private getRandomDirection() {
    return Phaser.Math.Between(0, 3);
  }

  private getRandomStep() {
    return Phaser.Math.Between(1, 5);
  }
}
