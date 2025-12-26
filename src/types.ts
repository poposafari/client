import { DEPTH, DIRECTION, PLAYER_STATUS, TEXTSTYLE, TEXTURE, TIME, TRIGGER } from './enums';
import { PostCheckoutOverworldObj } from './obj/post-checkout-overworld-obj';
import { ShopCheckoutOverworldObj } from './obj/shop-checkout-overworld-obj';
import { StatueOverworldObj } from './obj/statue-overworld-obj';
import { ErrorCode } from './core/errors';

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
export type ItemRank = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemCategory = 'pokeball' | 'berry' | 'tm_hm' | 'etc' | 'key';
export type PlayerGender = 'boy' | 'girl';
export type PlayerAvatar = '1' | '2' | '3' | '4';
export type PokeBoxBG = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15';
export type OverworldStatue = ShopCheckoutOverworldObj | PostCheckoutOverworldObj | StatueOverworldObj;

export interface SocketInitData {
  location: string;
  x: number;
  y: number;
  nickname: string;
  gender: PlayerGender;
  avatar: number;
  playtime: number;
  costume: PlayerCostumeRes;
  discoveredLocations: string[];
  pet: OtherPet | null;
  party: (number | null)[];
  slotItem: (number | null)[];
  option: { textSpeed: number | null; frame: number | null; backgroundVolume: number | null; effectVolume: number | null; tutorial: boolean | null };
  pBgs: number[];
  pcNames: string[];
  isStarter0: boolean;
  isStarter1: boolean;
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

export type PlayerPositionRes = {
  socketId: string;
  data: {
    x: number;
    y: number;
    movement: 'walk' | 'running' | 'ride' | 'surf';
    timestamp?: number;
  };
};

export type FacingPlayerRes = {
  socketId: string;
  data: 'up' | 'down' | 'left' | 'right';
};

export type OtherPet = {
  idx: number;
  texture: string | null;
};

export type ChangePetRes = {
  socketId: string;
  data: OtherPet | null;
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
  data: ErrorCode;
};

export type AccountReq = {
  username: string;
  password: string;
};

export type RegisterIngameReq = {
  nickname: string;
  gender: PlayerGender;
  avatar: PlayerAvatar;
  option: IngameOption;
};

export type LoginRes = {
  token: string;
  isDelete: boolean;
  isDeleteAt: string;
};

export type PlayerCostumeRes = {
  skin: number;
  eyes: number;
  hair: number;
  top: number;
  bottom: number;
  shoes: number;
  accessory0: number;
  accessory1: number;
  accessory2: number;
  accessory3: number;
};

export type PlayerPokedexRes = {
  gen1: string[];
  gen2: string[];
  gen3: string[];
  gen4: string[];
  gen5: string[];
  gen6: string[];
  gen7: string[];
  gen8: string[];
  gen9: string[];
};

export type GetIngameRes = {
  pcBg: number[];
  y: number;
  x: number;
  candy: number;
  money: number;
  pcName: string[];
  isStarter0: boolean;
  isStarter1: boolean;
  location: string;
  nickname: string;
  gender: PlayerGender;
  avatar: number;
  party: GetPcRes[];
  slotItem: (GetItemRes | null)[];
  createdAt: Date;
  playtime: number;
  discoveredLocations: string[];
  costume: PlayerCostumeRes;
  pokedex: PlayerPokedexRes;
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
  box: number;
  idx: number;
  pokedex: string;
  gender: PokemonGender;
  shiny: boolean;
  count: number;
  friendShip: number;
  skill: PokemonHiddenMove[];
  nickname: string | null;
  region: string;
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
  idx: number; //PlayerPokemon idx임.
  target: number; //PlayerPokemon의 진화 인덱스 번호.
  time: string; // ISO 8601 형식의 클라이언트 시간 (예: "2024-01-01T12:00:00.000Z")
};

export type LearnSkillReq = {
  idx: number; //PlayerPokemon idx임.
  target: number; //PlayerPokemon의 스킬 인덱스 번호임.
};

export type EvolPcRes = {
  box: number;
  pokemons: GetPcRes[];
};

export type BuyItemReq = {
  item: string;
  stock: number;
};

export type SellItemReq = {
  item: string;
  stock: number;
};

export type BuyItemRes = {
  idx: number;
  item: string;
  category: ItemCategory;
  stock: number;
  money: number;
};

export type SellItemRes = {
  idx: number;
  item: string;
  category: ItemCategory;
  stock: number;
  money: number;
};

export type UseItemReq = {
  item: string;
  cost: number;
};

export type EnterSafariReq = {
  overworld: string;
  time: TIME;
};

export type EnterSafariRes = {
  wilds: WildRes[];
  groundItems: GroundItemRes[];
};

export type CatchWildReq = {
  idx: number;
  ball: string;
  berry: string | null;
  parties: (number | null)[];
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
    pc: GetPcRes;
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
  skills: PokemonHiddenMove[];
  region: string;
  catch: boolean;
  eaten_berry: string | null;
  baseRate: number;
  fleeRate: number;
  count: number;
  type1: string;
  type2: string;
  rank: PokemonRank;
  spawn: PokemonSpawn;
};

export type FeedWildEatenBerryReq = {
  idx: number;
  berry: string;
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
  endDelay: number;
  end?: () => void;
};

export type Notice = {
  content: string;
  window: TEXTURE;
  textStyle?: TEXTSTYLE;
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
  skill: PokemonHiddenMove | null;
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
  skill: PokemonHiddenMove[];
};

export interface WildPokemonInfo {
  idx: number;
  catch: boolean;
  form: number;
  gender: PokemonGender;
  pokedex: string;
  shiny: boolean;
  skills: PokemonHiddenMove[] | null;
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

export enum StatueType {
  STATUE_WARNING = 'statue_warning',
  STATUE_SIGN = 'statue_sign',
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
  cursor: TEXTURE | string;
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
  name: string;
  x: number;
  y: number;
  direction: DIRECTION;
  script: string[];
};

export type SpecialNpc = 'shop' | 'post' | 'professor' | 'bicycle_shop';
export type SpecialNpcInfo = {
  type: SpecialNpc;
  key: string;
  name: string;
  x: number;
  y: number;
  direction: DIRECTION;
  script: string[];
  data?: unknown;
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

export type SignInfo = {
  texture: TEXTURE | string;
  x: number;
  y: number;
  script: string;
  scriptKey?: string;
  scriptParams?: string[];
  window: TEXTURE;
  textStyle?: TEXTSTYLE;
};

export type TriggerInfo = {
  x: number;
  y: number;
  trigger: TRIGGER;
  targetNpc: string | null;
};

export type IngameOption = {
  textSpeed: number;
  backgroundVolume: number;
  effectVolume: number;
  frame: number;
  tutorial: boolean;
};

export type IngameData = {
  avatar: number;
  candy: number;
  money: number;
  createdAt: Date;
  gender: PlayerGender;
  isStarter0: boolean;
  isStarter1: boolean;
  location: string;
  lastLocation: string | null;
  nickname: string;
  playtime: number;
  discoveredLocations: string[];
  costume: PlayerCostumeRes;
  pokedex: PlayerPokedexRes;
  x: number;
  y: number;
};

export type OverworldDoorData = {
  door: TEXTURE | string;
  x: number;
  y: number;
  offsetY: number;
  width: number;
  height: number;
};

export type OverworldInitPosData = {
  location: TEXTURE | string;
  x: number;
  y: number;
};
