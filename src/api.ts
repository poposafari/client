import axios from 'axios';
import { ApiResponse, apiWrap } from './core/api-wrap';
import { PokemonGender } from './object/pokemon-object';
import { MyPokemon } from './storage/box';
import { PlayerAvatar, PlayerGender } from './types';

const Axios = axios.create({
  baseURL: 'https://poposafari.net/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

type AccountRequest = {
  username: string;
  password: string;
};

type IngameRegisterReq = {
  nickname: string;
  gender: PlayerGender;
  avatar: PlayerAvatar;
};

type MoveToOverworldReq = {
  overworld: string;
};

type CatchSafariObjReq = {
  idx: number;
};

type CatchSafariWildPokemonReq = {
  idx: number;
  ball: string;
  berry: string | null;
  parties: (number | null)[];
};

type FeedBerryReq = {
  idx: number;
  berry: string | null;
};

type PokeboxRequest = {
  box: number;
};

type MovePokemonRequest = {
  pokedex: string;
  gender: PokemonGender;
  from: number;
  to: number;
};

type BuyItemRequest = {
  item: string;
  stock: number;
};

export const registerApi = (data: AccountRequest) => apiWrap(() => Axios.post('/account/register', data));
export const loginApi = (data: AccountRequest) => apiWrap(() => Axios.post('/account/login', data));
export const autoLoginApi = () => apiWrap(() => Axios.get('/account/auto-login'));
export const logoutApi = () => apiWrap(() => Axios.get('/account/logout'));
export const deleteAccountApi = () => apiWrap(() => Axios.get('/account/delete'));
export const getIngameApi = () => apiWrap(() => Axios.get('/ingame/userdata'));
export const ingameRegisterApi = (data: IngameRegisterReq) => apiWrap(() => Axios.post('/ingame/register', data));
export const getAllItemsApi = () => apiWrap(() => Axios.get('/bag/all'));
export const buyItemApi = (data: BuyItemRequest) => apiWrap(() => Axios.post('/bag/buy', data));
export const getPokeboxApi = (data: PokeboxRequest) => apiWrap(() => Axios.post('pokebox/get', data));
export const movePokemonApi = (data: MovePokemonRequest) => apiWrap(() => Axios.post('pokebox/move', data));
export const moveToOverworldApi = (data: MoveToOverworldReq) => apiWrap(() => Axios.post('/overworld/move', data));
export const useTicketApi = (data: MoveToOverworldReq) => apiWrap(() => Axios.post('/overworld/ticket', data));
export const catchGroundItem = (data: CatchSafariObjReq) => apiWrap(() => Axios.post('/overworld/catch/item', data));
export const catchWildPokemon = (data: CatchSafariWildPokemonReq) => apiWrap(() => Axios.post('/overworld/catch/pokemon', data));
export const feedBerryApi = (data: FeedBerryReq) => apiWrap(() => Axios.post('/overworld/feed/berry', data));
export const getAvailableTicketApi = () => apiWrap(() => Axios.get('/ticket/get'));
export const receiveAvailableTicketApi = () => apiWrap(() => Axios.get('/ticket/receive'));
