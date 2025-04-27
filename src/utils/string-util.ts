import { MyPokemon } from '../storage/box';

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

export function getPokemonOverworldOrIconKey(pokemon: MyPokemon) {
  let ret = '000';

  const pokedex = pokemon.pokedex;
  const shiny = pokemon.shiny ? 's' : '';
  const gender = pokemon.gender;

  ret = `${pokedex}${shiny}`;

  return ret;
}

export function getPokemonOverworldKey(data: string | null) {
  if (data) return data.split('_')[0];

  return '000';
}

export function getPokemonSpriteKey(pokemon: MyPokemon) {
  let ret = '000';

  const pokedex = pokemon.pokedex;
  const shiny = pokemon.shiny ? 's' : '';
  const gender = pokemon.gender;

  ret = `${pokedex}_${gender}${shiny}`;

  return ret;
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
