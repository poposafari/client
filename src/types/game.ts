import { TEXTURE } from './texture';

export const SYMBOL_FEMALE = '♀';
export const SYMBOL_MALE = '♂';
export const MONEY_SYMBOL = '';

export const OPTION_KEY = 'option';
export const LANGUAGE_KEY = 'i18nextLng';
export enum OptionKey {
  TEXT_SPEED = 'text_speed',
  MASTER_VOLUME = 'master_volume',
  SFX_VOLUME = 'sfx_volume',
  BGM_VOLUME = 'bgm_volume',
  WINDOW = 'window',
  PC_TUTORIAL = 'pc_tutorial',
  BATTLE_TUTORIAL = 'battle_tutorial',
  BAG_TUTORIAL = 'bag_tutorial',
  SAFFARI_TUTORIAL = 'safari_tutorial',
  /** 언어 옵션 (i18nextLng). OptionManager 저장/조회용. */
  LANGUAGE = 'i18nextLng',
}

export enum Language {
  KOREAN = 'ko',
  ENGLISH = 'en',
  JAPANESE = 'jp',
}

/** 오버월드 플레이어 움직임 상태 (UserManager에서 관리) */
export enum OverworldMovementState {
  WALK = 'walk',
  RUNNING = 'running',
  RIDE = 'ride',
  JUMP = 'jump',
  FISHING = 'fishing',
  SURF = 'surf',
}

/** 오버월드 마지막 바라본 방향 (UserManager 저장, 플레이어 생성 시 초기 방향으로 사용) */
export enum OverworldDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export interface Location {
  x: number;
  y: number;
  map: string;
}

export interface CurrentUserCostume {
  skin: string;
  hair: string;
  hairColor: string;
  outfit: string;
}

export type UserGender = 'male' | 'female';
export interface UserPcSettingsData {
  background: [number, number][]; // [[boxId, backgroundId], ...]
  name: [number, string][]; // [[boxId, "BoxName"], ...]
}

export interface UserPokemon {
  id: string;
  pokemonId: string;
  box: number;
  slot: number;
  gender: PokemonGender;
  region: PokemonRegion;
  form: string;
  held: string;
  catchCount: number;
  friendShip: number;
  shiny: boolean;
  enteredBoxAt: Date;
}

// 가방 아이템 데이터
export interface BagItem {
  id: string;
  quantity: number;
}

export interface UserProfile {
  nickname: string;
  money: number;
  candy: number;
  playTime: number;
  isNewbie: boolean;
  gender: UserGender;
  lastLocation: Location;
  lastCostume: CurrentUserCostume;
  lastParty: string[];
  lastQuickslot: string[];
  lastTownmap: string[];
  pcSettings: UserPcSettingsData;
  createdAt: string;
}

export type ItemRank = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemCategory = 'pokeball' | 'berry' | 'tm_hm' | 'etc' | 'key';
export type ItemData = {
  id: string;
  comment: string;
  type: ItemCategory;
  buyPrice: number;
  sellPrice: number;
  purchasable: boolean;
  sellable: boolean;
  usable: boolean;
  registerable: boolean;
};

export enum PokemonGender {
  NONE = 0,
  MALE = 1,
  FEMALE = 2,
}
export enum PokemonRegion {
  NONE = '',
  ALOLA = 'alola',
  GALAR = 'galar',
  HISUI = 'hisui',
  PALDEA = 'paldea',
}

export type PokemonRank = 'common' | 'rare' | 'epic' | 'legendary';
export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';
export type PokemonSpawn = 'land' | 'water';
export type PokemonHiddenMove =
  | 'move_cut'
  | 'move_fly'
  | 'move_surf'
  | 'move_strength'
  | 'move_flash'
  | 'move_rock-smash'
  | 'move_waterfall'
  | 'move_dive'
  | 'move_mean-look'
  | 'move_defog'
  | 'move_ancient-power'
  | 'move_double-hit'
  | 'move_dragon-pulse'
  | 'move_hyper-drill'
  | 'move_mimic'
  | 'move_rollout'
  | 'move_stomp'
  | 'move_taunt'
  | 'move_twin-beam';
export type PokemonData = {
  formName: string;
  nextEvol: {
    next: string[];
    cost: string[];
  };
  rate: {
    spawn: number;
    capture: number;
    flee: number;
    male: number;
    female: number;
  };
  rank: PokemonRank;
  type1: PokemonType;
  type2: PokemonType | null;
  spawn: PokemonSpawn[];
  skills: PokemonHiddenMove[];
  ability: string[];
  generation: string;
  height_m: string;
  weight_kg: string;
};

export type CostumeGenderData = {
  outfits: string[];
  hairs: string[][]; // [hairId, color1, color2, ...]
};

export type CostumeData = {
  skin: string[];
  male: CostumeGenderData;
  female: CostumeGenderData;
};
