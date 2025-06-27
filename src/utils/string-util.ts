import { getPokemonInfo } from '../data/pokemon';
import { MyPokemon } from '../storage/box';
import { PokemonGender } from '../types';

export function createZeroPad(value: number): string {
  return value.toString().padStart(4, '0');
}

export function isPokedexShiny(pokedex: string) {
  return pokedex.endsWith('s');
}

export function isFemale(pokedex: string) {
  return pokedex[4] === 'f';
}

export function getOriginPokedex(key: string) {
  return key.split('_')[0];
}

export function getGenderAndShinyInfo(key: string) {
  return key.split('_')[1];
}

export function trimLastChar(pokedex: string) {
  return pokedex.slice(0, -1);
}

export function getPartyKey(pokemon: MyPokemon | null) {
  if (!pokemon) return null;

  const pokedex = pokemon.pokedex;
  const shiny = pokemon.shiny ? 's' : '';
  const gender = pokemon.gender;
  const skills = pokemon.skill;
  // const form = pokemon.form;

  return `${pokedex}${shiny}_${gender}_${skills}`;
}

export function getPokemonOverworldOrIconKey(pokemon: MyPokemon | null) {
  if (!pokemon) return null;

  let ret = '000';

  const pokedex = pokemon.pokedex;
  const shiny = pokemon.shiny ? 's' : '';
  const gender = pokemon.gender;

  ret = `${pokedex}${shiny}`;

  return ret;
}

export function getPokemonOverworldKey(pokemon: MyPokemon | null) {
  if (!pokemon) return `000`;

  const shiny = pokemon.shiny ? 's' : '';

  return `${pokemon?.pokedex}${shiny}`;
}

export function getPokemonSpriteKey(pokemon: MyPokemon) {
  const shiny = pokemon.shiny ? 's' : '';
  let gender = pokemon.gender === 'male' ? 'm' : pokemon.gender === 'female' ? 'f' : '';

  return `pokemon_sprite${pokemon.pokedex}_${gender}${shiny}`;
}

export function getBattlePokemonSpriteKey(pokedex: string, shiny: boolean, gender: PokemonGender) {
  const isShiny = shiny ? 's' : '';
  const isGender = gender === 'male' ? 'm' : gender === 'female' ? 'f' : '';

  return `pokemon_sprite${pokedex}_${isGender}${isShiny}`;
}

export function getPokemonType(pokedex: string) {
  const type1 = getPokemonInfo(Number(pokedex))?.type1;
  const type2 = getPokemonInfo(Number(pokedex))?.type2;

  return [type1, type2];
}

export function isValidUsername(username: string): boolean {
  // 영어 소문자 + 숫자, 4~16자
  const usernameRegex = /^[a-z0-9]{4,16}$/;

  return usernameRegex.test(username);
}

export function isValidPassword(password: string): boolean {
  //영문 대소문자 + 숫자 + 특수문자(!@#$%^&*()_+), 6~20자
  const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+]{6,20}$/;

  return passwordRegex.test(password);
}

export function isValidNickname(nickname: string): boolean {
  const nicknameRegex = /^[\p{L}0-9]{2,10}$/u;

  return nicknameRegex.test(nickname);
}

export function replacePercentSymbol(input: string, replacement: any[]): string {
  let index = 0;
  return input.replace(/%/g, (match) => {
    if (index < replacement.length) {
      return replacement[index++];
    }
    return match;
  });
}
