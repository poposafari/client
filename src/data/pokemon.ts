import { POKEMON_RANK } from '../enums/pokemon-rank';
import { TYPE } from '../enums/type';

export const MAX_POKEDEX = 9;

export interface PokemonInfo {
  rank: POKEMON_RANK;
  nextEvole: string | null;
  type1: TYPE | null;
  type2: TYPE | null;
  size: 1 | 2 | 3 | 4;
}

const initial: Record<string, PokemonInfo> = {
  '000': { rank: POKEMON_RANK.NORMAL, nextEvole: null, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  '001': { rank: POKEMON_RANK.NORMAL, nextEvole: '002', type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  '002': { rank: POKEMON_RANK.NORMAL, nextEvole: '003', type1: TYPE.GRASS, type2: TYPE.POISON, size: 2 },
  '003': { rank: POKEMON_RANK.NORMAL, nextEvole: null, type1: TYPE.GRASS, type2: TYPE.POISON, size: 3 },
  '004': { rank: POKEMON_RANK.NORMAL, nextEvole: '005', type1: TYPE.FIRE, type2: null, size: 1 },
  '005': { rank: POKEMON_RANK.NORMAL, nextEvole: '006', type1: TYPE.FIRE, type2: null, size: 2 },
  '006': { rank: POKEMON_RANK.NORMAL, nextEvole: null, type1: TYPE.FIRE, type2: TYPE.FLYING, size: 4 },
  '007': { rank: POKEMON_RANK.NORMAL, nextEvole: '008', type1: TYPE.WATER, type2: null, size: 1 },
  '008': { rank: POKEMON_RANK.NORMAL, nextEvole: '009', type1: TYPE.WATER, type2: null, size: 2 },
  '009': { rank: POKEMON_RANK.NORMAL, nextEvole: null, type1: TYPE.WATER, type2: null, size: 3 },
};

export const pokemonData = new Proxy(initial, {
  get(target, key: string) {
    if (key in target) {
      return target[key];
    } else {
      console.warn(`Pokemon '${key}' does not exist.`);
      return null;
    }
  },
});
