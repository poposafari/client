export type PokeSlot = null | 1 | 2 | 3 | 4 | 5 | 6;

export interface MyPokemon {
  pokedex: string;
  shiny: boolean;
  gender: 'm' | 'f' | '';
  form: number;
  captureDate: string;
  capturePokeball: string;
  captureCount: number;
  skill: 0 | 1 | 2 | 3 | 4 | null;
}

export class Box {
  private static instance: Box;

  private mypokemons: Map<string, MyPokemon> = new Map();

  constructor() {}

  static getInstance(): Box {
    if (!Box.instance) {
      Box.instance = new Box();
    }
    return Box.instance;
  }

  setup() {
    // this.addMyPokemon({ pokedex: '001', shiny: false, gender: 'm', form: 0, captureDate: '2025-02-19', capturePokeball: '001', captureCount: 1, skill: null });
  }

  addMyPokemon(pokemon: MyPokemon) {
    const key = this.generateKey(pokemon);
    if (!this.mypokemons.has(key)) {
      this.mypokemons.set(key, pokemon);
    }
  }

  getMyPokemons(): MyPokemon[] {
    return Array.from(this.mypokemons.values());
  }

  cleanMyPokemons() {
    this.mypokemons.clear();
  }

  hasPokemon(pokedex: string, shiny: boolean, gender: 'm' | 'f' | ''): MyPokemon | null {
    const key = `${pokedex}-${shiny ? 'shiny' : 'normal'}-${gender}`;
    return this.mypokemons.get(key) || null;
  }

  private generateKey(pokemon: MyPokemon): string {
    return `${pokemon.pokedex}-${pokemon.shiny ? 'shiny' : 'normal'}-${pokemon.gender}`;
  }
}
