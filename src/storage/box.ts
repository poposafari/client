import { PokemonGender, PokemonSkill } from '../object/pokemon-object';

export interface MyPokemon {
  pokedex: string;
  gender: PokemonGender;
  shiny: boolean;
  form: number;
  count: number;
  skill: PokemonSkill;
  captureDate: string;
  capturePokeball: string;
  captureLocation: string;
  nickname: string | null;
}

export const MAX_BOX_BG = 15;

export class Box {
  private static instance: Box;

  private pokemons: MyPokemon[] = [];

  private constructor() {}

  static getInstance(): Box {
    if (!Box.instance) {
      Box.instance = new Box();
    }
    return Box.instance;
  }

  setup(data: MyPokemon[]) {
    this.pokemons = data ? [...data] : [];
  }

  addMyPokemon(pokemon: MyPokemon) {
    this.pokemons.push(pokemon);
  }

  getMyPokemons(): MyPokemon[] {
    return [...this.pokemons];
  }

  cleanMyPokemons() {
    this.pokemons = [];
  }

  // hasPokemon(pokedex: string, shiny: boolean, gender: PokemonGender): MyPokemon | null {
  //   return this.pokemons.find((p) => p.pokedex === pokedex && p.shiny === shiny && p.gender === gender) || null;
  // }
}
