import { SafariData } from '../data';
import { DIRECTION, KEY, PLAYER_STATUS, Season, TextSpeed, TYPE } from '../enums';
import { PlayerPokemon } from '../obj/player-pokemon';

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

export function getPokemonSpriteKey(pokemon: PlayerPokemon, temp?: string) {
  const shiny = pokemon.getShiny() ? 's' : '';
  let gender = pokemon.getGender() === 'male' ? 'm' : pokemon.getGender() === 'female' ? 'f' : '';
  let pokedex = temp ? temp : pokemon.getPokedex();

  return `pokemon_sprite${pokedex}_${gender}${shiny}`;
}

export function getOverworldPokemonTexture(pokemon: PlayerPokemon | null) {
  if (!pokemon) return `pokemon_overworld000`;

  const pokedex = pokemon.getPokedex();
  const shiny = pokemon.getShiny() ? 's' : '';

  return `pokemon_overworld${pokedex}${shiny}`;
}

export function getPokemonType(type: string | null) {
  if (!type) return null;

  switch (type) {
    case 'fire':
      return TYPE.FIRE;
    case 'water':
      return TYPE.WATER;
    case 'electric':
      return TYPE.ELECTRIC;
    case 'grass':
      return TYPE.GRASS;
    case 'ice':
      return TYPE.ICE;
    case 'fighting':
      return TYPE.FIGHT;
    case 'poison':
      return TYPE.POISON;
    case 'ground':
      return TYPE.GROUND;
    case 'flying':
      return TYPE.FLYING;
    case 'psychic':
      return TYPE.PSYCHIC;
    case 'bug':
      return TYPE.BUG;
    case 'rock':
      return TYPE.ROCK;
    case 'ghost':
      return TYPE.GHOST;
    case 'dragon':
      return TYPE.DRAGON;
    case 'dark':
      return TYPE.DARK;
    case 'steel':
      return TYPE.STEEL;
    case 'fairy':
      return TYPE.FAIRY;
    case 'normal':
      return TYPE.NORMAL;
  }
}

export function formatDateTime(isoString: string) {
  if (!isoString) return '';

  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  return formatter.format(date);
}

export function getCurrentSeason(): Season {
  const now = new Date();
  const month = now.getMonth(); // 0 (1월) ~ 11 (12월)

  if (month >= 2 && month <= 4) {
    return Season.SPRING;
  }
  if (month >= 5 && month <= 7) {
    return Season.SUMMER;
  }
  if (month >= 8 && month <= 10) {
    return Season.FALL;
  }
  return Season.WINTER;
}

export function isSafariData(obj: any): obj is SafariData {
  return (
    obj &&
    typeof obj === 'object' &&
    'key' in obj &&
    typeof obj.key === 'string' &&
    'cost' in obj &&
    typeof obj.cost === 'number' &&
    'x' in obj &&
    typeof obj.x === 'number' &&
    'y' in obj &&
    typeof obj.y === 'number'
  );
}

export function changeDirectionToKey(direction: DIRECTION) {
  switch (direction) {
    case DIRECTION.UP:
      return KEY.UP;
    case DIRECTION.DOWN:
      return KEY.DOWN;
    case DIRECTION.LEFT:
      return KEY.LEFT;
    case DIRECTION.RIGHT:
      return KEY.RIGHT;
  }

  return KEY.UP;
}

export const matchTypeWithBerryRate = (berry: string | null, type1: string, type2: string | null) => {
  if (!berry) return 1.0;

  switch (berry) {
    case '011':
      if ([type1, type2].includes('fire')) return 1.2;
      break;
    case '012':
      if ([type1, type2].includes('water')) return 1.2;
      break;
    case '013':
      if ([type1, type2].includes('electric')) return 1.2;
      break;
    case '014':
      if ([type1, type2].includes('grass')) return 1.2;
      break;
    case '015':
      if ([type1, type2].includes('ice')) return 1.2;
      break;
    case '016':
      if ([type1, type2].includes('fighting')) return 1.2;
      break;
    case '017':
      if ([type1, type2].includes('poison')) return 1.2;
      break;
    case '018':
      if ([type1, type2].includes('ground')) return 1.2;
      break;
    case '019':
      if ([type1, type2].includes('flying')) return 1.2;
      break;
    case '020':
      if ([type1, type2].includes('psychic')) return 1.2;
      break;
    case '021':
      if ([type1, type2].includes('bug')) return 1.2;
      break;
    case '022':
      if ([type1, type2].includes('rock')) return 1.2;
      break;
    case '023':
      if ([type1, type2].includes('ghost')) return 1.2;
      break;
    case '024':
      if ([type1, type2].includes('dragon')) return 1.2;
      break;
    case '025':
      if ([type1, type2].includes('dark')) return 1.2;
      break;
    case '026':
      if ([type1, type2].includes('steel')) return 1.2;
      break;
    case '027':
      if ([type1, type2].includes('fairy')) return 1.2;
      break;
    case '028':
      if ([type1, type2].includes('normal')) return 1.2;
      break;
    case '029':
      return 1.2;
  }

  return 1.0;
};

export const matchPokemonWithRarityRate = (rank: string) => {
  let rate = 0;

  switch (rank) {
    case 'rare':
      rate = 0.02;
      break;
    case 'epic':
      rate = 0.04;
      break;
    case 'legendary':
      rate = 0.06;
      break;
  }

  return rate;
};

export const matchItemRank = (rank: string) => {
  let rate = 0;

  switch (rank) {
    case 'common':
      rate = 0;
      break;
    case 'rare':
      rate = 1;
      break;
    case 'epic':
      rate = 2;
      break;
    case 'legendary':
      rate = 3;
      break;
  }

  return rate;
};

export const matchPlayerStatus = (status: PLAYER_STATUS) => {
  switch (status) {
    case PLAYER_STATUS.WALK:
      return 'walk';
    case PLAYER_STATUS.RUNNING:
      return 'running';
    case PLAYER_STATUS.RIDE:
      return 'ride';
    case PLAYER_STATUS.SURF:
      return 'surf';
  }

  return 'jump';
};

export const matchPlayerStatusToDirection = (direction: DIRECTION) => {
  switch (direction) {
    case DIRECTION.UP:
      return 'up';
    case DIRECTION.DOWN:
      return 'down';
    case DIRECTION.LEFT:
      return 'left';
    case DIRECTION.RIGHT:
      return 'right';
  }

  return 'down';
};

export const changeTextSpeedToDigit = (speed: TextSpeed) => {
  let ret = 0;

  switch (speed) {
    case TextSpeed.SLOW:
      ret = 0;
      break;
    case TextSpeed.MID:
      ret = 1;
      break;
    case TextSpeed.FAST:
      ret = 2;
      break;
    default:
      ret = 1;
      break;
  }

  return ret;
};
