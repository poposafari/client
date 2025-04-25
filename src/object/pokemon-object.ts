import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { OBJECT } from '../enums/object-type';
import { POKEMON_STATUS } from '../enums/pokemon-status';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldInfo } from '../storage/overworld-info';
import { PlayerInfo } from '../storage/player-info';
import { isPokedexShiny } from '../utils/string-util';
import { MovableObject } from './movable-object';

export class PokemonObject extends MovableObject {
  private pokedex: string;
  private gender: 0 | 1 | 2;
  private skill: 0 | 1 | 2 | 3 | 4 | null;
  private habitat: 'forest' | 'lake' | 'mt';
  private readonly directions: DIRECTION[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.RIGHT, DIRECTION.LEFT];
  private readonly keys: KEY[] = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.LEFT];
  private timer?: Phaser.Time.TimerEvent;
  private againTimer?: Phaser.Time.TimerEvent;
  private status: POKEMON_STATUS;

  constructor(
    scene: InGameScene,
    texture: TEXTURE | string,
    pokedex: string,
    gender: 0 | 1 | 2,
    skill: 0 | 1 | 2 | 3 | 4 | null,
    habitat: 'forest' | 'lake' | 'mt',
    x: number,
    y: number,
    map: Phaser.Tilemaps.Tilemap,
    nickname: string,
    overworldInfo: OverworldInfo,
    playerInfo: PlayerInfo,
  ) {
    super(scene, texture, x, y, map, nickname, OBJECT.POKEMON, playerInfo, overworldInfo);
    this.pokedex = pokedex;
    this.gender = gender;
    this.skill = skill;
    this.habitat = habitat;
    this.status = POKEMON_STATUS.ROAMING;
    this.setScale(1.5);
    this.setSpeed(2);
    this.setSmoothFrames([12, 0, 4, 8]);
    if (isPokedexShiny(pokedex)) {
      this.dummy2.setTexture(TEXTURE.OVERWORLD_SHINY);
      this.dummy2.play(ANIMATION.OVERWORLD_SHINY);
      this.dummy2.setScale(2.4);
    }

    this.scheduleRandomMovement();
  }

  getGender() {
    return this.gender;
  }

  getSkill() {
    return this.skill;
  }

  getHabitat() {
    return this.habitat;
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

    this.dummy1.anims.play({
      key: 'emo_1',
      repeat: 0,
      frameRate: 7,
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
