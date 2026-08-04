import { PokedexEntry } from '@poposafari/types';
import { getPokedexBaseId } from '@poposafari/utils';

export interface CaughtSets {
  keySet: Set<string>;
  baseSet: Set<string>;
}

export function buildCaughtSets(pokedex: PokedexEntry[]): CaughtSets {
  const keySet = new Set<string>();
  const baseSet = new Set<string>();
  for (const entry of pokedex) {
    if (entry.caughtCount <= 0) continue;
    keySet.add(entry.pokedexId);
    baseSet.add(getPokedexBaseId(entry.pokedexId));
  }
  return { keySet, baseSet };
}

export function isPokedexSeen(pokedexKey: string, sets: CaughtSets): boolean {
  const base = getPokedexBaseId(pokedexKey);
  return pokedexKey === base ? sets.baseSet.has(base) : sets.keySet.has(pokedexKey);
}
