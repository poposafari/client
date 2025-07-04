import { POKEMON_RANK } from '../enums/pokemon-rank';
import { TYPE } from '../enums/type';

export const MAX_POKEDEX = 9;

export interface PokemonInfo {
  rank: POKEMON_RANK;
  type1: TYPE | null;
  type2: TYPE | null;
  size: 1 | 2 | 3 | 4;
}

export const females = [3, 12, 19, 20, 25, 26, 41, 42, 44, 45, 64, 65, 84, 85, 97, 111, 112, 118, 119, 123, 129, 130];

export const PokemonData: Record<number, PokemonInfo> = {
  1: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  2: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  3: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  4: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  5: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  6: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: TYPE.FLYING, size: 1 },
  7: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  8: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  9: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  10: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: null, size: 1 },
  11: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: null, size: 1 },
  12: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: TYPE.FLYING, size: 1 },
  13: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: TYPE.POISON, size: 1 },
  14: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: TYPE.POISON, size: 1 },
  15: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: TYPE.POISON, size: 1 },
  16: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FLYING, size: 1 },
  17: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FLYING, size: 1 },
  18: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FLYING, size: 1 },
  19: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  20: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  21: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FLYING, size: 1 },
  22: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FLYING, size: 1 },
  23: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  24: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  25: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ELECTRIC, type2: null, size: 1 },
  26: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ELECTRIC, type2: null, size: 1 },
  27: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GROUND, type2: null, size: 1 },
  28: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GROUND, type2: null, size: 1 },
  29: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  30: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  31: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: TYPE.GROUND, size: 1 },
  32: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  33: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  34: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: TYPE.GROUND, size: 1 },
  35: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FAIRY, type2: null, size: 1 },
  36: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FAIRY, type2: null, size: 1 },
  37: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  38: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  39: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FAIRY, size: 1 },
  40: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FAIRY, size: 1 },
  41: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: TYPE.FLYING, size: 1 },
  42: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: TYPE.FLYING, size: 1 },
  43: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  44: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  45: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  46: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: TYPE.GRASS, size: 1 },
  47: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: TYPE.GRASS, size: 1 },
  48: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: TYPE.POISON, size: 1 },
  49: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: TYPE.POISON, size: 1 },
  50: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GROUND, type2: null, size: 1 },
  51: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GROUND, type2: null, size: 1 },
  52: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  53: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  54: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  55: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  56: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIGHT, type2: null, size: 1 },
  57: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIGHT, type2: null, size: 1 },
  58: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  59: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  60: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  61: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  62: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.FIGHT, size: 1 },
  63: { rank: POKEMON_RANK.NORMAL, type1: TYPE.PSYCHIC, type2: null, size: 1 },
  64: { rank: POKEMON_RANK.NORMAL, type1: TYPE.PSYCHIC, type2: null, size: 1 },
  65: { rank: POKEMON_RANK.NORMAL, type1: TYPE.PSYCHIC, type2: null, size: 1 },
  66: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIGHT, type2: null, size: 1 },
  67: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIGHT, type2: null, size: 1 },
  68: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIGHT, type2: null, size: 1 },
  69: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  70: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  71: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.POISON, size: 1 },
  72: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.POISON, size: 1 },
  73: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.POISON, size: 1 },
  74: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ROCK, type2: TYPE.GROUND, size: 1 },
  75: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ROCK, type2: TYPE.GROUND, size: 1 },
  76: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ROCK, type2: TYPE.GROUND, size: 1 },
  77: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  78: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  79: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.PSYCHIC, size: 1 },
  80: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.PSYCHIC, size: 1 },
  81: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ELECTRIC, type2: TYPE.STEEL, size: 1 },
  82: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ELECTRIC, type2: TYPE.STEEL, size: 1 },
  83: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FLYING, size: 1 },
  84: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FLYING, size: 1 },
  85: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: TYPE.FLYING, size: 1 },
  86: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  87: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.ICE, size: 1 },
  88: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  89: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  90: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  91: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.ICE, size: 1 },
  92: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GHOST, type2: TYPE.POISON, size: 1 },
  93: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GHOST, type2: TYPE.POISON, size: 1 },
  94: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GHOST, type2: TYPE.POISON, size: 1 },
  95: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ROCK, type2: TYPE.GROUND, size: 1 },
  96: { rank: POKEMON_RANK.NORMAL, type1: TYPE.PSYCHIC, type2: null, size: 1 },
  97: { rank: POKEMON_RANK.NORMAL, type1: TYPE.PSYCHIC, type2: null, size: 1 },
  98: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  99: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  100: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ELECTRIC, type2: null, size: 1 },
  101: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ELECTRIC, type2: null, size: 1 },
  102: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.PSYCHIC, size: 1 },
  103: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: TYPE.PSYCHIC, size: 1 },
  104: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GROUND, type2: null, size: 1 },
  105: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GROUND, type2: null, size: 1 },
  106: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIGHT, type2: null, size: 1 },
  107: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIGHT, type2: null, size: 1 },
  108: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  109: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  110: { rank: POKEMON_RANK.NORMAL, type1: TYPE.POISON, type2: null, size: 1 },
  111: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GROUND, type2: TYPE.ROCK, size: 1 },
  112: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GROUND, type2: TYPE.ROCK, size: 1 },
  113: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  114: { rank: POKEMON_RANK.NORMAL, type1: TYPE.GRASS, type2: null, size: 1 },
  115: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  116: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  117: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  118: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  119: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  120: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  121: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.PSYCHIC, size: 1 },
  122: { rank: POKEMON_RANK.NORMAL, type1: TYPE.PSYCHIC, type2: TYPE.FAIRY, size: 1 },
  123: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: TYPE.FLYING, size: 1 },
  124: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ICE, type2: TYPE.PSYCHIC, size: 1 },
  125: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ELECTRIC, type2: null, size: 1 },
  126: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  127: { rank: POKEMON_RANK.NORMAL, type1: TYPE.BUG, type2: null, size: 1 },
  128: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  129: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  130: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.FLYING, size: 1 },
  131: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: TYPE.ICE, size: 1 },
  132: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  133: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  134: { rank: POKEMON_RANK.NORMAL, type1: TYPE.WATER, type2: null, size: 1 },
  135: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ELECTRIC, type2: null, size: 1 },
  136: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: null, size: 1 },
  137: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  138: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ROCK, type2: TYPE.WATER, size: 1 },
  139: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ROCK, type2: TYPE.WATER, size: 1 },
  140: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ROCK, type2: TYPE.WATER, size: 1 },
  141: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ROCK, type2: TYPE.WATER, size: 1 },
  142: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ROCK, type2: TYPE.FLYING, size: 1 },
  143: { rank: POKEMON_RANK.NORMAL, type1: TYPE.NORMAL, type2: null, size: 1 },
  144: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ICE, type2: TYPE.FLYING, size: 1 },
  145: { rank: POKEMON_RANK.NORMAL, type1: TYPE.ELECTRIC, type2: TYPE.FLYING, size: 1 },
  146: { rank: POKEMON_RANK.NORMAL, type1: TYPE.FIRE, type2: TYPE.FLYING, size: 1 },
  147: { rank: POKEMON_RANK.NORMAL, type1: TYPE.DRAGON, type2: null, size: 1 },
  148: { rank: POKEMON_RANK.NORMAL, type1: TYPE.DRAGON, type2: null, size: 1 },
  149: { rank: POKEMON_RANK.NORMAL, type1: TYPE.DRAGON, type2: TYPE.FLYING, size: 1 },
  150: { rank: POKEMON_RANK.NORMAL, type1: TYPE.PSYCHIC, type2: null, size: 1 },
  151: { rank: POKEMON_RANK.NORMAL, type1: TYPE.PSYCHIC, type2: null, size: 1 },
};

export function getPokemonInfo(pokedexNumber: number): PokemonInfo | null {
  const info = PokemonData[pokedexNumber];
  if (!info) {
    console.warn(`not found Pokemon`);
    return null;
  }
  return info;
}
