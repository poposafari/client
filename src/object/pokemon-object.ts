import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { OBJECT } from '../enums/object-type';
import { POKEMON_STATUS } from '../enums/pokemon-status';
import { TEXTURE } from '../enums/texture';
import { TYPE } from '../enums/type';
import { InGameScene } from '../scenes/ingame-scene';
import { PlayerInfo } from '../storage/player-info';
import { PokemonRank, PokemonSpawn } from '../types';
import { getPokemonType, isPokedexShiny } from '../utils/string-util';
import { MovableObject } from './movable-object';

export class PokemonObject extends MovableObject {
  private idx: number;
  private pokedex: string;
  private gender: PokemonGender;
  private skill: PokemonSkill[] | null;
  private spawn: PokemonSpawn;
  private eatenBerry: string | null;
  private baseRate: number;
  private lastAddCalc: number;
  private rank: PokemonRank;
  private shiny: boolean;
  private readonly directions: DIRECTION[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.RIGHT, DIRECTION.LEFT];
  private readonly keys: KEY[] = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.LEFT];
  private timer?: Phaser.Time.TimerEvent;
  private againTimer?: Phaser.Time.TimerEvent;
  private status: POKEMON_STATUS;

  constructor(
    scene: InGameScene,
    texture: TEXTURE | string,
    idx: number,
    pokedex: string,
    gender: PokemonGender,
    skill: PokemonSkill[] | null,
    spawn: PokemonSpawn,
    shiny: boolean,
    eatenBerry: string | null,
    baseRate: number,
    rank: PokemonRank,
    x: number,
    y: number,
    map: Phaser.Tilemaps.Tilemap,
    nickname: string,
  ) {
    super(scene, texture, x, y, map, nickname, OBJECT.POKEMON);
    this.idx = idx;
    this.pokedex = pokedex;
    this.gender = gender;
    this.skill = skill ? skill : null;
    this.spawn = spawn;
    this.status = POKEMON_STATUS.ROAMING;
    this.shiny = shiny;
    this.eatenBerry = eatenBerry;
    this.baseRate = baseRate;
    this.lastAddCalc = 1.0;
    this.rank = rank;

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

  getIdx() {
    return this.idx;
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

  getRank() {
    return this.rank;
  }

  move() {
    this.movementStop = false;
  }

  capture() {
    if (this.status === POKEMON_STATUS.ROAMING) {
      this.status = POKEMON_STATUS.CAPTURED;
    }
  }

  setEatenBerry(item: string | null) {
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

  getCalcCatchRate(item?: string, type1?: TYPE, type2?: TYPE): number {
    const types = getPokemonType(this.pokedex);
    const parties = PlayerInfo.getInstance().getPartySlot();
    let calc = this.baseRate * 100.0;
    this.lastAddCalc = this.calcItemCatchRate(this.eatenBerry!, types[0]!, types[1]!);

    let partyScoreSum = 0;
    for (const party of parties) {
      if (party) {
        const shinyRate = party.shiny ? 2.0 : 1.0;
        const captureCntRate = party.count > 0 ? party.count * 0.01 : 0;
        let rarityRate = 1.0;

        if (party.rank === 'rare') rarityRate = 1.2;
        else if (party.rank === 'epic') rarityRate = 1.5;
        else if (party.rank === 'legendary') rarityRate = 2.0;

        const score = shinyRate * captureCntRate * rarityRate;
        partyScoreSum += score;
      }
    }

    if (item && item !== '001') {
      const addCalc = this.calcItemCatchRate(item, type1, type2);
      this.lastAddCalc = this.lastAddCalc * addCalc;
    }

    return Math.round((calc * this.lastAddCalc + partyScoreSum * 10) * 10) / 10;
  }

  private calcItemCatchRate(item: string, type1?: TYPE, type2?: TYPE) {
    const berryRate = 1.2;

    switch (item) {
      case '002':
        return 1.0;
      case '003':
        return 1.5;
      case '004':
        return 2.0;
      case '011':
        if ([type1, type2].includes(TYPE.FIRE)) return berryRate;
        break;
      case '012':
        if ([type1, type2].includes(TYPE.WATER)) return berryRate;
        break;
      case '013':
        if ([type1, type2].includes(TYPE.ELECTRIC)) return berryRate;
        break;
      case '014':
        if ([type1, type2].includes(TYPE.GRASS)) return berryRate;
        break;
      case '015':
        if ([type1, type2].includes(TYPE.ICE)) return berryRate;
        break;
      case '016':
        if ([type1, type2].includes(TYPE.FIGHT)) return berryRate;
        break;
      case '017':
        if ([type1, type2].includes(TYPE.POISON)) return berryRate;
        break;
      case '018':
        if ([type1, type2].includes(TYPE.GROUND)) return berryRate;
        break;
      case '019':
        if ([type1, type2].includes(TYPE.FLYING)) return berryRate;
        break;
      case '020':
        if ([type1, type2].includes(TYPE.PSYCHIC)) return berryRate;
        break;
      case '021':
        if ([type1, type2].includes(TYPE.BUG)) return berryRate;
        break;
      case '022':
        if ([type1, type2].includes(TYPE.ROCK)) return berryRate;
        break;
      case '023':
        if ([type1, type2].includes(TYPE.GHOST)) return berryRate;
        break;
      case '024':
        if ([type1, type2].includes(TYPE.DRAGON)) return berryRate;
        break;
      case '025':
        if ([type1, type2].includes(TYPE.DARK)) return berryRate;
        break;
      case '026':
        if ([type1, type2].includes(TYPE.STEEL)) return berryRate;
        break;
      case '027':
        if ([type1, type2].includes(TYPE.FAIRY)) return berryRate;
        break;
      case '028':
        if ([type1, type2].includes(TYPE.NORMAL)) return berryRate;
        break;
      case '029':
        return berryRate;
        break;
    }

    return 1.0;
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
