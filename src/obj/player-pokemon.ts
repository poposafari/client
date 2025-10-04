import { TYPE } from '../enums';
import { PokemonEvol, PokemonGender, PokemonRank, PokemonSkill } from '../types';

export class PlayerPokemon {
  private idx: number;
  private pokedex: string;
  private gender: PokemonGender;
  private shiny: boolean;
  private form: string;
  private count: number;
  private skill: PokemonSkill[];
  private nickname: string | null;
  private created_location: string;
  private created_at: string;
  private created_ball: string;
  private rank: PokemonRank;
  private evol: PokemonEvol;
  private type_1: TYPE | null;
  private type_2: TYPE | null;

  constructor(
    idx: number,
    pokedex: string,
    gender: PokemonGender,
    shiny: boolean,
    form: string,
    count: number,
    skill: PokemonSkill[],
    nickname: string | null,
    created_location: string,
    created_at: string,
    created_ball: string,
    rank: PokemonRank,
    evol: PokemonEvol,
    type_1: TYPE,
    type_2: TYPE | null,
  ) {
    this.idx = idx;
    this.pokedex = pokedex;
    this.gender = gender;
    this.shiny = shiny;
    this.form = form;
    this.count = count;
    this.skill = skill;
    this.nickname = nickname;
    this.created_location = created_location;
    this.created_at = created_at;
    this.created_ball = created_ball;
    this.rank = rank;
    this.evol = evol;
    this.type_1 = type_1;
    this.type_2 = type_2;
  }

  public getIdx(): number {
    return this.idx;
  }

  public getPokedex(): string {
    return this.pokedex;
  }

  public getGender(): PokemonGender {
    return this.gender;
  }

  public getShiny(): boolean {
    return this.shiny;
  }

  public getForm(): string {
    return this.form;
  }

  public getCount(): number {
    return this.count;
  }

  public getSkill(): PokemonSkill[] {
    return this.skill;
  }

  public getNickname(): string | null {
    return this.nickname;
  }

  public getCreatedLocation(): string {
    return this.created_location;
  }

  public getCreatedAt(): string {
    return this.created_at;
  }

  public getCreatedBall(): string {
    return this.created_ball;
  }

  public getRank(): PokemonRank {
    return this.rank;
  }

  public getEvol(): PokemonEvol {
    return this.evol;
  }

  public getType1(): TYPE | null {
    return this.type_1;
  }

  public getType2(): TYPE | null {
    return this.type_2;
  }

  public setNickname(value: string) {
    this.nickname = value;
  }
}
