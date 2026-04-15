import { BagItem, CurrentUserCostume, Location, UserPokemon, UserProfile } from './game';

export type LoginLocalUiInput = { username: string; password: string } | 'register';
export type RegisterLocalUiInput = { username: string; password: string } | 'login';
export type TitleUiInput = 'continue' | 'newgame' | 'mystery_gift' | 'option' | 'logout';
export type OptionUiInput = 'exit';

export interface LoginLocalReq {
  username: string;
  password: string;
}

export interface RegisterLocalReq {
  username: string;
  password: string;
}

/** @deprecated getMe()로 대체됨 */
export interface GetUserRes {
  profile: UserProfile;
  pc: Record<number, UserPokemon[]>;
  bag: Record<string, BagItem>;
  costume: string[];
}

// ── 게임 진입 API (GET /api/user/me) ──
export interface GetMeRes {
  profile: {
    nickname: string;
    gender: number;
    money: number;
    playtime: number;
    hasStarter: boolean;
    lastMapId: number;
    lastX: number;
    lastY: number;
  };
  equippedCostumes: { costumeId: string }[];
  party: {
    id: number;
    pokedexId: string;
    level: number;
    friendship: number;
    gender: number;
    isShiny: boolean;
    nickname: string | null;
    abilityId: string;
    natureId: string;
    skills: unknown;
    heldItemId: string | null;
    partySlot: number | null;
    ballId: number;
  }[];
  itemSlots: {
    itemId: number;
    quantity: number;
    slotNumber: number | null;
  }[];
  essentialItems: {
    itemId: string;
    quantity: number;
    slotNumber: number | null;
  }[];
}

// ── Lazy Load API 응답 타입 ──
export interface PokemonBoxItem {
  id: number;
  pokedexId: string;
  level: number;
  friendship: number;
  gender: number;
  isShiny: boolean;
  nickname: string | null;
  abilityId: string;
  natureId: string;
  skills: unknown;
  heldItemId: string | null;
  boxNumber: number | null;
  gridNumber: number | null;
  ballId: number;
  caughtLocation: string;
  caughtAt: string;
}

export interface BoxMetaItem {
  boxNumber: number;
  wallpaper: number;
  name: string;
}

export interface PcSlotState {
  id: number;
  boxNumber: number | null;
  gridNumber: number | null;
  partySlot: number | null;
}

export interface NicknameChange {
  id: number;
  nickname: string | null;
}

export interface ItemBagItem {
  itemId: number;
  quantity: number;
  slotNumber: number | null;
}

export interface PokedexEntry {
  pokedexId: number;
  caughtCount: number;
  registeredAt: string;
}

export interface TownMapEntry {
  mapId: number;
  visitedAt: string;
}

export interface CostumeEntry {
  costumeId: string;
  isEquipped: boolean;
}

export interface CreateUserReq {
  nickname: string;
  gender: 'male' | 'female';
  costume: {
    skin: string;
    hair: string;
    outfit: string;
  };
}

// {
//     "index": 0,
//     "pokemonId": "0001",
//     "region": "",
//     "form": null,
//     "gender": 1,
//     "shiny": false,
//     "comment": "이상해씨"
// },
export interface StartingPokemon {
  index: number;
  pokemonId: string;
  region: string;
  form: string | null;
  gender: number;
  shiny: boolean;
  comment: string;
}

export interface GetStartingPokemonsRes {
  list: StartingPokemon[];
}

export interface SafariCatchReq {
  uid: string;
}

// ── 사파리 베잇/락 (POST /api/game/safari/bait|rock) ──
export interface SafariBaitReq {
  uid: string;
}
export interface SafariRockReq {
  uid: string;
}
export type SafariBaitRockRes = { result: 'flee' | 'stay' };

export interface SafariCatchCaughtPokemon {
  id: number;
  pokedexId: string;
  level: number;
  gender: number;
  isShiny: boolean;
  nickname: string | null;
  natureId: string;
  abilityId: string;
  heldItemId: string | null;
  skills: string[];
  boxNumber: number;
  gridNumber: number;
  ballId: number;
  caughtLocation: string;
}

export type SafariCatchRes =
  | {
      result: 'caught';
      pokemon: SafariCatchCaughtPokemon;
      reward: { candyId: string; candyQuantity: number };
    }
  | { result: 'fail' }
  | { result: 'flee' };
