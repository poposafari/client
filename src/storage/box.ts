export type PokeSlot = null | 1 | 2 | 3 | 4 | 5 | 6;

export interface MyPokemon {
  pokedex: string;
  captureDate: string;
  capturePokeball: string;
  captureCount: number;
  skill: 0 | 1 | 2 | 3 | 4 | null;
}

export class Box {
  private mypokemons: Map<string, MyPokemon> = new Map();

  constructor() {}

  setup() {
    this.addMyPokemon({ pokedex: '001_f', captureDate: '2025-02-19', capturePokeball: '001', captureCount: 1, skill: null });
    this.addMyPokemon({ pokedex: '002_ms', captureDate: '2025-02-10', capturePokeball: '002', captureCount: 1, skill: null });
    this.addMyPokemon({ pokedex: '003_fs', captureDate: '2024-12-10', capturePokeball: '004', captureCount: 20, skill: null });
    this.addMyPokemon({ pokedex: '003_m', captureDate: '2024-12-10', capturePokeball: '004', captureCount: 20, skill: null });
    this.addMyPokemon({ pokedex: '006_fs', captureDate: '2025-02-01', capturePokeball: '003', captureCount: 1, skill: null });
    this.addMyPokemon({ pokedex: '009_f', captureDate: '2025-01-11', capturePokeball: '002', captureCount: 1, skill: null });
    this.addMyPokemon({ pokedex: '008_f', captureDate: '2023-11-11', capturePokeball: '001', captureCount: 1, skill: null });
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

  hasPokemon(pokedex: string) {
    return this.mypokemons.get(pokedex);
  }
}
