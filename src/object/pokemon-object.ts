import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { OBJECT } from '../enums/object-type';
import { POKEMON_STATUS } from '../enums/pokemon-status';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { PokemonSpawn } from '../types';
import { isPokedexShiny } from '../utils/string-util';
import { MovableObject } from './movable-object';

export class PokemonObject extends MovableObject {
  private pokedex: string;
  private gender: PokemonGender;
  private skill: PokemonSkill[] | null;
  private spawn: PokemonSpawn;
  private eatenBerry: string | null;
  private shiny: boolean;
  private readonly directions: DIRECTION[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.RIGHT, DIRECTION.LEFT];
  private readonly keys: KEY[] = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.LEFT];
  private timer?: Phaser.Time.TimerEvent;
  private againTimer?: Phaser.Time.TimerEvent;
  private status: POKEMON_STATUS;

  constructor(
    scene: InGameScene,
    texture: TEXTURE | string,
    pokedex: string,
    gender: PokemonGender,
    skill: PokemonSkill[] | null,
    spawn: PokemonSpawn,
    shiny: boolean,
    x: number,
    y: number,
    map: Phaser.Tilemaps.Tilemap,
    nickname: string,
  ) {
    super(scene, texture, x, y, map, nickname, OBJECT.POKEMON);
    this.pokedex = pokedex;
    this.gender = gender;
    this.skill = skill ? skill : null;
    this.spawn = spawn;
    this.status = POKEMON_STATUS.ROAMING;
    this.shiny = shiny;
    this.eatenBerry = null;

    this.setScale(1.5);
    this.setSpeed(2);
    this.setSmoothFrames([12, 0, 4, 8]);
    if (this.shiny) {
      this.dummy2.setTexture(TEXTURE.OVERWORLD_SHINY);
      this.dummy2.play(ANIMATION.OVERWORLD_SHINY);
      this.dummy2.setScale(2.4);
    }

    this.scheduleRandomMovement();
  }

  getGender() {
    return this.gender;
  }

  getShiny() {
    return this.shiny;
  }

  getSkill() {
    return this.skill;
  }

  getSpawn() {
    return this.spawn;
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

  capture() {
    if (this.status === POKEMON_STATUS.ROAMING) {
      this.status = POKEMON_STATUS.CAPTURED;
    }
  }

  setEatenBerry(item: string) {
    this.eatenBerry = item;
  }

  getEatenBerry() {
    return this.eatenBerry;
  }

  private getAnimation(key: KEY) {
    const shiny = this.shiny ? 's' : '';

    switch (key) {
      case KEY.UP:
        return `pokemon_overworld${this.pokedex}${shiny}_up`;
      case KEY.DOWN:
        return `pokemon_overworld${this.pokedex}${shiny}_down`;
      case KEY.LEFT:
        return `pokemon_overworld${this.pokedex}${shiny}_left`;
      case KEY.RIGHT:
        return `pokemon_overworld${this.pokedex}${shiny}_right`;
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
    const shiny = this.shiny ? 's' : '';
    this.stopMovement();

    switch (playerDirection) {
      case DIRECTION.DOWN:
        this.startAnmation(`pokemon_overworld${this.pokedex}${shiny}_up`);
        break;
      case DIRECTION.LEFT:
        this.startAnmation(`pokemon_overworld${this.pokedex}${shiny}_right`);
        break;
      case DIRECTION.RIGHT:
        this.startAnmation(`pokemon_overworld${this.pokedex}${shiny}_left`);
        break;
      case DIRECTION.UP:
        this.startAnmation(`pokemon_overworld${this.pokedex}${shiny}_down`);
        break;
    }

    this.dummy1.anims.play({
      key: 'emo_1',
      repeat: 0,
      frameRate: 7,
    });

    this.getScene().time.delayedCall(1000, () => {
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

export type PokemonGender = 'male' | 'female' | 'none';
export type PokemonSkill = 'none' | 'surf' | 'darkeyes';

export class PlayerPokemon {
  private pokedex: string;
  private gender: PokemonGender;
  private shiny: boolean;
  private form: number;
  private count: number;
  private skill: PokemonSkill;
  private nickname: string;
  private captureBall: string;
  private captureDate: Date;
  private captureLocation: string;

  constructor(
    pokedex: string,
    gender: PokemonGender,
    shiny: boolean,
    form: number,
    count: number,
    skill: PokemonSkill,
    nickname: string,
    captureBall: string,
    captureDate: Date,
    captureLocation: string,
  ) {
    this.pokedex = pokedex;
    this.gender = gender;
    this.shiny = shiny;
    this.form = form;
    this.count = count;
    this.skill = skill;
    this.nickname = nickname;
    this.captureBall = captureBall;
    this.captureDate = captureDate;
    this.captureLocation = captureLocation;
  }
}
