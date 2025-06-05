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
}

export interface TranslationItem {
  [key: string]: TranslationItemInfo;
}

export interface TranslationNpc {
  [key: string]: TranslationNpcInfo;
}

export interface TranslationPokemonInfo {
  name: string;
  description: string;
}

export interface TranslationPokemon {
  [key: string]: TranslationPokemonInfo;
}
