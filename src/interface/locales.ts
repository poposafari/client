export interface TranslationDefault {
  [key: string]: string;
}

export interface TranslationItemInfo {
  name: string;
  description: string;
}

export interface TranslationNpcInfo {
  name: string;
  scripts: string[];
  postAction: string;
}

export interface TranslationItem {
  [key: string]: TranslationItemInfo;
}

export interface TranslationNpc {
  [key: string]: TranslationNpcInfo;
}

export interface TranslationPokemonInfo {
  name: string;
  rank: string;
  generation: number;
  evoles_from: string;
  type1: string;
  type2: string;
  description: string;
}

export interface TranslationPokemon {
  [key: string]: TranslationPokemonInfo;
}
