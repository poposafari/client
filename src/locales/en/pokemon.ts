/**
 * Re-exports KO pokemon for now so en locale has the pokemon namespace.
 * Replace with full English translations (name, species, description) when ready.
 */
import { pokemon as koPokemon } from '../ko/pokemon';

type TranslationPokemon = {
  [key: string]: { name: string; species: string; description: string };
};

export const pokemon: TranslationPokemon = koPokemon;
