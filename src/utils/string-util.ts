import { SafariData } from '../data';
import { BATTLE_AREA, DIRECTION, ItemCategory, KEY, PLAYER_STATUS, Season, TextSpeed, TIME, TYPE } from '../enums';
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

/**
 * 브라우저의 현재 시간을 기반으로 시간대를 계산하고 TIME enum을 반환
 * 시간대 분류:
 * - 새벽 (DAWN): 4-6시 (0.0 ~ 0.25)
 * - 낮 (DAY): 6-18시 (0.25 ~ 0.75)
 * - 해질녘 (DUSK): 18-20시 (0.75 ~ 0.83)
 * - 밤 (NIGHT): 20-4시 (0.83 ~ 1.0)
 *
 * @returns {TIME} 현재 시간대 (DAWN, DAY, DUSK, NIGHT)
 */
export function getCurrentTimeOfDay(): TIME {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  if (hours >= 4 && hours < 6) {
    return TIME.DAWN;
  } else if (hours >= 6 && hours < 18) {
    return TIME.DAY;
  } else if (hours >= 18 && hours < 20) {
    return TIME.DUSK;
  } else {
    return TIME.NIGHT;
  }
}

/**
 * 브라우저의 현재 시간을 기반으로 시간대를 0.0~1.0 범위의 값으로 계산
 * 시간대 분류:
 * - 새벽: 4-6시 (0.0 ~ 0.25)
 * - 낮: 6-18시 (0.25 ~ 0.75)
 * - 해질녘: 18-20시 (0.75 ~ 0.83)
 * - 밤: 20-4시 (0.83 ~ 1.0)
 *
 * @returns {number} 0.0~1.0 범위의 시간대 값
 */
export function getCurrentTimeOfDayValue(): number {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  let adjustedTime: number;

  if (hours >= 4 && hours < 6) {
    // 새벽: 4-6시 (0.0 ~ 0.25)
    adjustedTime = (((hours - 4) * 60 + minutes) / (2 * 60)) * 0.25;
  } else if (hours >= 6 && hours < 18) {
    // 낮: 6-18시 (0.25 ~ 0.75)
    // 6시 = 0.25, 18시 = 0.75 (경계값 포함하지 않음)
    adjustedTime = 0.25 + (((hours - 6) * 60 + minutes) / (12 * 60)) * 0.5;
  } else if (hours >= 18 && hours < 20) {
    // 해질녘: 18-20시 (0.75 ~ 0.83)
    // 18시 = 0.75, 20시 = 0.83
    adjustedTime = 0.75 + (((hours - 18) * 60 + minutes) / (2 * 60)) * 0.08;
  } else {
    // 밤: 20-4시 (0.83 ~ 1.0)
    if (hours >= 20) {
      // 20시-24시: 0.83 ~ 1.0
      adjustedTime = 0.83 + (((hours - 20) * 60 + minutes) / (4 * 60)) * 0.17;
    } else {
      // 0시-4시: 0.83 ~ 1.0 (자정 이후 새벽 4시 이전)
      adjustedTime = 0.83 + (((hours + 4) * 60 + minutes) / (4 * 60)) * 0.17;
    }
  }

  return adjustedTime;
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
      return KEY.ARROW_UP;
    case DIRECTION.DOWN:
      return KEY.ARROW_DOWN;
    case DIRECTION.LEFT:
      return KEY.ARROW_LEFT;
    case DIRECTION.RIGHT:
      return KEY.ARROW_RIGHT;
  }

  return KEY.ARROW_UP;
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

export const formatPlaytime = (updatedAt: Date | string, createdAt: Date | string): string => {
  const updated = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const diffMs = updated.getTime() - created.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getBattleArea = (location: string) => {
  switch (location) {
    case 's001':
    case 's002':
    case 's006':
    case 's010':
    case 's011':
      return BATTLE_AREA.FIELD;
    case 's003':
    case 's004':
    case 's005':
      return BATTLE_AREA.CAVE;
    case 's007':
    case 's008':
    case 's009':
      return BATTLE_AREA.FOREST;
  }
};

export const checkItemType = (item: string): ItemCategory => {
  switch (item) {
    case '001':
    case '002':
    case '003':
    case '004':
      return ItemCategory.POKEBALL;
    case '011':
    case '012':
    case '013':
    case '014':
    case '015':
    case '016':
    case '017':
    case '018':
    case '019':
    case '020':
    case '021':
    case '022':
    case '023':
    case '024':
    case '025':
    case '026':
    case '027':
    case '028':
    case '029':
      return ItemCategory.BERRY;
    default:
      return ItemCategory.ETC;
  }
};
