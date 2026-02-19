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

export interface GetUserRes {
  profile: UserProfile;
  pc: Record<number, UserPokemon[]>; // 박스 번호를 key로 하는 포켓몬 배열
  bag: Record<string, BagItem>; // itemId를 key로 하는 아이템 정보
  costume: string[]; // 코스튬 ID 배열
}

export interface CreateUserReq {
  nickname: string;
  gender: 'male' | 'female';
  costume: {
    skin: string;
    hair: string;
    hairColor: string;
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
