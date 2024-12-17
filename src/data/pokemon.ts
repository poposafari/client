import i18next from '../i18n';
import { createZeroPad } from '../utils/string-util';

export interface Pokemon {
  name: string;
  rank: string;
  generation: number;
  evoles_from: string;
  type1: string;
  type2: string;
  description: string;
  size: 1 | 2 | 3;
}

export const pokemons: Map<string, Pokemon> = new Map();

i18next.on('initialized', () => {
  for (let i = 1; i <= 9; i++) {
    const key = createZeroPad(i);
    pokemons.set(key, {
      name: i18next.t(`pokemon:${key}.name`),
      rank: i18next.t(`pokemon:${key}.rank`),
      generation: Number.parseInt(i18next.t(`pokemon:${key}.generation`)),
      evoles_from: i18next.t(`pokemon:${key}.evoles_from`),
      type1: i18next.t(`pokemon:${key}.type1`),
      type2: i18next.t(`pokemon:${key}.type2`),
      description: i18next.t(`pokemon:${key}.description`),
      size: 1,
    });
  }

  console.log(pokemons);
});

export function getPokemon(key: string) {
  return pokemons.get(key);
}
