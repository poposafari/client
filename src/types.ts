import { EVENT } from './enums/event';
import { MODE } from './enums/mode';
import { TEXTURE } from './enums/texture';

export const MaxItemSlot = 9;
export const MaxPartySlot = 6;
export const MaxPokeboxBgSlot = 33;

export type PlayerGender = 'boy' | 'girl';
export type PlayerAvatar = '1' | '2' | '3' | '4';
export type PokeBoxBG = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15';

export type ListForm = {
  name: string;
  nameImg: TEXTURE | string;
  etc: string;
  etcImg: TEXTURE | string;
};

export type Message = {
  type: 'sys' | 'default' | 'battle';
  format: 'talk' | 'question';
  content: string;
  speed: number;
  end?: EVENT;
  questionYes?: EVENT;
  questionNo?: EVENT;
};

export type Reward = {
  item: string;
  stock: number;
};

export type RewardForm = {
  pokedex: string;
  gender: PokemonGender;
  shiny: boolean;
  form: number;
  skill: PokemonSkill | null;
  rewards: Reward[];
};

export interface WildPokemonInfo {
  idx: number;
  catch: boolean;
  form: number;
  gender: PokemonGender;
  pokedex: string;
  shiny: boolean;
  skills: PokemonSkill[] | null;
  spawns: PokemonSpawn;
}

export interface GroundItemInfo {
  idx: number;
  catch: boolean;
  item: string;
  stock: number;
}

export type PokemonGender = 'male' | 'female' | 'none';
export type PokemonHabitat = 'land' | 'lake' | 'mt';
export type PokemonSpawn = 'land' | 'water';
export type PokemonSkill = 'none' | 'surf' | 'darkeyes';
