import { getPokemonData } from '../../data';
import { PlayerPokedexRes, WildRes } from '../../types';

export class PlayerPokedex {
  private static instance: PlayerPokedex;

  private gen1: string[] = [];
  private gen2: string[] = [];
  private gen3: string[] = [];
  private gen4: string[] = [];
  private gen5: string[] = [];
  private gen6: string[] = [];
  private gen7: string[] = [];
  private gen8: string[] = [];
  private gen9: string[] = [];

  constructor() {}

  static getInstance(): PlayerPokedex {
    if (!PlayerPokedex.instance) {
      PlayerPokedex.instance = new PlayerPokedex();
    }
    return PlayerPokedex.instance;
  }

  init() {}

  setup(data: PlayerPokedexRes) {
    this.gen1 = data.gen1;
    this.gen2 = data.gen2;
    this.gen3 = data.gen3;
    this.gen4 = data.gen4;
    this.gen5 = data.gen5;
    this.gen6 = data.gen6;
    this.gen7 = data.gen7;
    this.gen8 = data.gen8;
    this.gen9 = data.gen9;
  }

  getGen(gen: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9): string[] {
    switch (gen) {
      case 1:
        return this.gen1;
      case 2:
        return this.gen2;
      case 3:
        return this.gen3;
      case 4:
        return this.gen4;
      case 5:
        return this.gen5;
      case 6:
        return this.gen6;
      case 7:
        return this.gen7;
      case 8:
        return this.gen8;
      case 9:
        return this.gen9;
      default:
        return [];
    }
  }

  matchGen(pokedex: string) {
    for (let gen = 1; gen <= 9; gen++) {
      if (this.getGen(gen as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9).includes('owned_' + pokedex) || this.getGen(gen as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9).includes('seen_' + pokedex)) {
        return true;
      }
    }
    return false;
  }

  add(data: WildRes) {
    const pokemon = getPokemonData(data.pokedex);
    const ownedKey = data.region && data.region.trim() !== '' ? `owned_${data.pokedex}_${data.region}` : `owned_${data.pokedex}`;

    if (!pokemon) return;
    if (this.matchGen(ownedKey)) return;

    switch (pokemon.generation) {
      case '1':
        this.gen1.push(ownedKey);
        break;
      case '2':
        this.gen2.push(ownedKey);
        break;
      case '3':
        this.gen3.push(ownedKey);
        break;
      case '4':
        this.gen4.push(ownedKey);
        break;
      case '5':
        this.gen5.push(ownedKey);
        break;
      case '6':
        this.gen6.push(ownedKey);
        break;
      case '7':
        this.gen7.push(ownedKey);
        break;
      case '8':
        this.gen8.push(ownedKey);
        break;
      case '9':
        this.gen9.push(ownedKey);
        break;
    }
  }
}

export const Pokedex = PlayerPokedex.getInstance();
