import { DEPTH, DIRECTION, HttpErrorCode, ItemCategory, OBJECT, PLAYER_STATUS, TEXTURE } from './enums';
import { PlayerItem } from './obj/player-item';
import { PlayerOption } from './obj/player-option';
import { PlayerPokemon } from './obj/player-pokemon';
import { PostCheckoutOverworldObj } from './obj/post-checkout-overworld-obj';
import { ShopCheckoutOverworldObj } from './obj/shop-checkout-overworld-obj';

export type TranslationDefault = {
  [key: string]: string;
};

export type TranslationItemInfo = {
  name: string;
  description: string;
};

export type TranslationNpcInfo = {
  name: string;
  scripts: string[];
};

export type TranslationItem = {
  [key: string]: TranslationItemInfo;
};

export type TranslationNpc = {
  [key: string]: TranslationNpcInfo;
};

export type TranslationPokemonInfo = {
  name: string;
  species: string;
  description: string;
};

export type TranslationPokemon = {
  [key: string]: TranslationPokemonInfo;
};

export type PokemonGender = 'male' | 'female' | 'none';
export type PokemonHabitat = 'land' | 'lake' | 'mt';
export type PokemonSpawn = 'land' | 'water';
export type PokemonSkill = 'none' | 'surf' | 'dark_eyes';
export type PokemonRank = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemRank = 'common' | 'rare' | 'epic' | 'legendary';
export type PlayerGender = 'boy' | 'girl';
export type PlayerAvatar = '1' | '2' | '3' | '4';
export type PokeBoxBG = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15';
export type OverworldStatue = ShopCheckoutOverworldObj | PostCheckoutOverworldObj;

export interface SocketInitData {
  location: string;
  x: number;
  y: number;
  nickname: string;
  gender: PlayerGender;
  avatar: number;
  pet: string | null;
  option: { textSpeed: number | null; frame: number | null; backgroundVolume: number | null; effectVolume: number | null };
  pc: { bgs: number[]; names: string[] };
}

export type MoveLocation = {
  from: string | null;
  to: string;
  toX: number;
  toY: number;
};

export type MovementPlayer = {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  movement: 'walk' | 'running' | 'jump' | 'surf' | 'ride';
  pet: string | null;
};

export type OtherPlayerEnterRes = {
  socketId: string;
  player: SocketInitData;
};

export type OtherPlayerExitRes = {
  socketId: string;
  player: SocketInitData;
};

export type CurrentPlayersInRoomRes = {
  location: string;
  players: Array<{ socketId: string; player: SocketInitData }>;
};

export type PlayerMovementRes = {
  socketId: string;
  data: MovementPlayer;
};

export interface OtherPlayerInfo {
  socketId: string;
  data: SocketInitData;
}

export type ApiResponse<T> = {
  result: true;
  data: T;
};

export type ApiErrorResponse = {
  result: false;
  data: HttpErrorCode;
};

export type AccountReq = {
  username: string;
  password: string;
};

export type RegisterIngameReq = {
  nickname: string;
  gender: PlayerGender;
  avatar: PlayerAvatar;
};

export type LoginRes = {
  token: string;
  isDelete: boolean;
  isDeleteAt: string;
};

export type GetIngameRes = {
  pet: GetPcRes | null;
  pcBg: number[];
  y: number;
  x: number;
  candy: number;
  pcName: string[];
  isStarter: boolean;
  isTutorial: boolean;
  location: string;
  nickname: string;
  gender: PlayerGender;
  avatar: number;
  party: GetPcRes[];
  slotItem: (GetItemRes | null)[];
  createdAt: Date;
  updatedAt: Date;
  bag: GetItemRes[];
  option: IngameOption;
};

export type GetItemRes = {
  idx: number;
  item: string;
  category: ItemCategory;
  stock: number;
};

export type GetPcReq = {
  box: number;
};

export type GetPcRes = {
  idx: number;
  pokedex: string;
  gender: PokemonGender;
  shiny: boolean;
  form: string;
  count: number;
  skill: PokemonSkill[];
  nickname: string | null;
  createdLocation: string;
  createdAt: string;
  createdBall: string;
  rank: PokemonRank;
  evol: PokemonEvol;
  type_1: string;
  type_2: string;
};

export type MovePcReq = {
  target: number;
  from: number;
  to: number;
};

export type EvolPcReq = {
  target: number;
};

export type BuyItemReq = {
  item: string;
  stock: number;
};

export type BuyItemRes = {
  idx: number;
  item: string;
  category: ItemCategory;
  stock: number;
  candy: number;
};

export type UseItemReq = {
  item: string;
  cost: number;
};

export type EnterSafariReq = {
  overworld: string;
};

export type EnterSafariRes = {
  wilds: WildRes[];
  groundItems: GroundItemRes[];
};

export type CatchWildReq = {
  idx: number;
  ball: string;
  berry: string | null;
  parties: number[];
};

export type CatchGroundItemReq = {
  idx: number;
};

export type CatchStarterPokemonReq = {
  idx: number;
};

export type CatchRewardRes = {
  item: string;
  stock: number;
  category: ItemCategory;
};

export type CatchWildSuccessRes = {
  catch: boolean;
  rewards: {
    candy: number;
    items: CatchRewardRes[];
  };
};

export type CatchWildFailRes = {
  catch: boolean;
  flee: boolean;
};

export type WildRes = {
  idx: number;
  pokedex: string;
  gender: PokemonGender;
  shiny: boolean;
  skills: PokemonSkill[];
  form: string;
  catch: boolean;
  eaten_berry: string | null;
  baseRate: number;
  type1: string;
  type2: string;
  rank: PokemonRank;
  spawn: PokemonSpawn;
};

export type GroundItemRes = {
  idx: number;
  item: string;
  stock: number;
  catch: boolean;
  rank: ItemRank;
};

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
  endDelay?: 1000;
  end?: () => void;
  questionYes?: () => void;
  questionNo?: () => void;
};

export type Question = {
  type: 'sys' | 'default';
  content: string;
  speed: number;
  yes: () => Promise<void>;
  no: () => Promise<void>;
  end?: () => void;
};

export type Talk = {
  type: 'sys' | 'default';
  content: string;
  speed: number;
  end?: () => void;
};

export type Notice = {
  content: string;
};

export type InputNickname = {
  content: string;
  title: string;
};

export type Reward = {
  item: string;
  stock: number;
  category: ItemCategory;
};

export type RewardForm = {
  pokedex: string;
  gender: PokemonGender;
  shiny: boolean;
  form: number;
  skill: PokemonSkill | null;
  candy: number;
  rewards: Reward[];
};

export type EvolData = {
  start: string;
  next: string;
};

export type MoveToOverworld = {
  type: 'direct' | 'enter' | 'exit';
  idx: string;
};

export type Otherplayer = {
  overworld: string | null;
  x: number | null;
  y: number | null;
  gender: PlayerGender;
  avatar: PlayerAvatar;
  nickname: string | null;
  pet: string | null;
};

export type OtherObjectMovementQueue = {
  id: number;
  direction: DIRECTION;
  status: PLAYER_STATUS;
};

export type OtherObjectStartSurf = {
  id: number;
  direction: DIRECTION;
};

export type PlayerMove = {
  overworld: string;
  x: number;
  y: number;
  direction: string;
  status: string;
};

export type PlayerPet = {
  id: number;
  pet: string | null;
};

export interface NextEvol {
  next: string | null;
  cost: number | string;
}

export type PlayerPokemonDto = {
  idx: number;
  pokedex: string;
  count: number;
  shiny: boolean;
  form: string;
  created_at: Date;
  updated_at: Date;
  created_location: string;
  updated_location: string;
  created_ball: string;
  updated_ball: string;
  nickname: string;
  gender: PokemonGender;
  skill: PokemonSkill[];
};

export interface WildPokemonInfo {
  idx: number;
  catch: boolean;
  form: number;
  gender: PokemonGender;
  pokedex: string;
  shiny: boolean;
  skills: PokemonSkill[] | null;
  eaten_berry: string | null;
  baseRate: number;
  rank: PokemonRank;
  spawns: PokemonSpawn;
}

export type GroundItemInfo = {
  idx: number;
  catch: boolean;
  item: string;
  stock: number;
};

export type PokemonEvol = {
  next: string | null;
  cost: number;
};

export enum ShopType {
  SHOP_0 = 'shop_0',
  SHOP_1 = 'shop_1',
}

export enum PostOfficeType {
  POST_0 = 'post_0',
  POST_1 = 'post_1',
}

export type MenuListSetting = {
  scale: number;
  etcScale: number;
  windowWidth: number;
  offsetX: number;
  offsetY: number;
  depth: number;
  per: number;
  info: ListForm[];
  window: TEXTURE | string;
  isAllowLRCancel?: boolean;
};

export type MapInfo = {
  texture: TEXTURE;
  tilesets: TEXTURE[];
};

export type Layer = {
  idx: number;
  texture: TEXTURE;
  depth: DEPTH;
};

export type ForegroundLayer = {
  idx: number;
  texture: TEXTURE[];
  depth: DEPTH;
};

export type NpcInfo = {
  key: string;
  x: number;
  y: number;
};

export type DoorInfo = {
  texture: TEXTURE | string;
  x: number;
  y: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
  goal: {
    location: string;
    x: number;
    y: number;
  };
};

export type StatueInfo = {
  texture: TEXTURE | string;
  x: number;
  y: number;
  type: OBJECT.STATUE | OBJECT.SHOP_CHECKOUT | OBJECT.POST_CHECKOUT;
  statueType: ShopType | PostOfficeType;
};

export type IngameOption = {
  textSpeed: number;
  backgroundVolume: number;
  effectVolume: number;
  frame: number;
};

export type IngameData = {
  avatar: number;
  candy: number;
  createdAt: Date;
  gender: PlayerGender;
  isStarter: boolean;
  isTutorial: boolean;
  location: string;
  lastLocation: string | null;
  nickname: string;
  party: (PlayerPokemon | null)[];
  pcBg: number[];
  pcName: string[];
  pet: PlayerPokemon | null;
  slotItem: (PlayerItem | null)[];
  updatedAt: Date;
  x: number;
  y: number;
  option: PlayerOption;
};
