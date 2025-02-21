export type PokeSlot = null | 1 | 2 | 3 | 4 | 5 | 6;

export interface MyPokemon {
  pokedex: string;
  captureDate: string;
  capturePokeball: string;
  captureCount: number;
  gender: 0 | 1 | 2;
  skill: 0 | 1 | 2 | 3 | 4 | null;
}

export class Box {
  private mypokemons: Map<string, MyPokemon> = new Map();

  constructor() {}

  setup() {
    this.addMyPokemon({ pokedex: '001', captureDate: '2025-02-19', capturePokeball: '001', captureCount: 1, gender: 0, skill: null });
    this.addMyPokemon({ pokedex: '002s', captureDate: '2025-02-10', capturePokeball: '002', captureCount: 1, gender: 1, skill: null });
    this.addMyPokemon({ pokedex: '003', captureDate: '2024-12-10', capturePokeball: '004', captureCount: 20, gender: 1, skill: null });
    this.addMyPokemon({ pokedex: '006s', captureDate: '2025-02-01', capturePokeball: '003', captureCount: 1, gender: 1, skill: null });
    this.addMyPokemon({ pokedex: '009s', captureDate: '2025-01-11', capturePokeball: '002', captureCount: 1, gender: 1, skill: null });
    this.addMyPokemon({ pokedex: '008', captureDate: '2023-11-11', capturePokeball: '001', captureCount: 1, gender: 1, skill: null });
  }

  addMyPokemon(pokemon: MyPokemon) {
    if (!this.mypokemons.has(pokemon.pokedex)) {
      this.mypokemons.set(pokemon.pokedex, pokemon);
    }
  }

  getMyPokemons(): MyPokemon[] {
    return Array.from(this.mypokemons.values()).flat();
  }

  cleanMyPokemons() {
    this.mypokemons.clear();
  }
}
