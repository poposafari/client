import i18next from 'i18next';
import { femalePokemonFrontPokedex, femalePokemonIconPokedex, femalePokemonOverworldPokedex } from '../data';
import { BATTLE_AREA, DIRECTION, ItemCategory, KEY, PLAYER_STATUS, POKEMON_TYPE, Season, TextSpeed, TEXTURE, TIME, TYPE } from '../enums';
import { PlayerPokemon } from '../obj/player-pokemon';
import { WildRes } from '../types';
import { PlayerGlobal } from '../core/storage/player-storage';
import { Bag } from '../core/storage/bag-storage';

export function createZeroPad(value: number, length: number = 4): string {
  return value.toString().padStart(length, '0');
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

  const bonusRate = 1.05;

  switch (berry) {
    case 'occa-berry':
      if ([type1, type2].includes('fire')) return bonusRate;
      break;
    case 'passho-berry':
      if ([type1, type2].includes('water')) return bonusRate;
      break;
    case 'wacan-berry':
      if ([type1, type2].includes('electric')) return bonusRate;
      break;
    case 'rindo-berry':
      if ([type1, type2].includes('grass')) return bonusRate;
      break;
    case 'yache-berry':
      if ([type1, type2].includes('ice')) return bonusRate;
      break;
    case 'chople-berry':
      if ([type1, type2].includes('fighting')) return bonusRate;
      break;
    case 'kebia-berry':
      if ([type1, type2].includes('poison')) return bonusRate;
      break;
    case 'shuca-berry':
      if ([type1, type2].includes('ground')) return bonusRate;
      break;
    case 'coba-berry':
      if ([type1, type2].includes('flying')) return bonusRate;
      break;
    case 'payapa-berry':
      if ([type1, type2].includes('psychic')) return bonusRate;
      break;
    case 'tanga-berry':
      if ([type1, type2].includes('bug')) return bonusRate;
      break;
    case 'charti-berry':
      if ([type1, type2].includes('rock')) return bonusRate;
      break;
    case 'kasib-berry':
      if ([type1, type2].includes('ghost')) return bonusRate;
      break;
    case 'haban-berry':
      if ([type1, type2].includes('dragon')) return bonusRate;
      break;
    case 'colbur-berry':
      if ([type1, type2].includes('dark')) return bonusRate;
      break;
    case 'babiri-berry':
      if ([type1, type2].includes('steel')) return bonusRate;
      break;
    case 'roseli-berry':
      if ([type1, type2].includes('fairy')) return bonusRate;
      break;
    case 'chilan-berry':
      if ([type1, type2].includes('normal')) return bonusRate;
      break;
    case 'enigma-berry':
      return bonusRate;
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

export const formatPlaytime = (value: number): string => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

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

export const matchBallAnimation = (item: string): string => {
  switch (item) {
    case 'poke-ball':
      return '002';
    case 'great-ball':
      return '003';
    case 'ultra-ball':
      return '004';
  }

  return '001';
};

export const matchPokemonEvolve = (pokemon: PlayerPokemon) => {
  return `pokemon:${pokemon.getPokedex()}.evolve`;
};

export const getPokemonTextureFromPlayerPokemon = (type: 'icon' | 'overworld' | 'front', pokemon: PlayerPokemon | null) => {
  if (pokemon) {
    const shiny = pokemon.getShiny() ? 's' : '';
    const gender = pokemon.getGender();
    const pokedex = pokemon.getPokedex();
    const region = pokemon.getRegion() ? '_' + pokemon.getRegion() : '';

    switch (type) {
      case 'icon':
        if (femalePokemonIconPokedex.includes(pokedex) && gender === 'female') {
          return `pokemon.icon.${pokedex}${shiny}${region}_female`;
        }
        return `pokemon.icon.${pokedex}${shiny}${region}`;
      case 'overworld':
        if (femalePokemonOverworldPokedex.includes(pokedex) && gender === 'female') {
          return `pokemon.overworld.${pokedex}s${region}_female`;
        }
        return `pokemon.overworld.${pokedex}${shiny}${region}`;
      case 'front':
        if (femalePokemonFrontPokedex.includes(pokedex) && gender === 'female') {
          return `pokemon.front.${pokedex}${shiny}${region}_female`;
        }
        return `pokemon.front.${pokedex}${shiny}${region}`;
    }
  } else {
    switch (type) {
      case 'icon':
        return `pokemon.icon.0000`;
      case 'overworld':
        return `pokemon.overworld.0000`;
      case 'front':
        return `pokemon.front.0000`;
    }
  }
};

export const getPokemonTextureFromWildPokemon = (type: 'overworld' | 'front', pokemon: WildRes | null) => {
  if (pokemon) {
    const shiny = pokemon.shiny ? 's' : '';
    const region = pokemon.region ? '_' + pokemon.region : '';
    const pokedex = pokemon.pokedex;
    const gender = pokemon.gender;

    switch (type) {
      case 'overworld':
        if (femalePokemonOverworldPokedex.includes(pokedex) && gender === 'female') {
          return `pokemon.overworld.${pokedex}s${region}_female`;
        }

        return `pokemon.overworld.${pokedex}${shiny}${region}`;
      case 'front':
        if (femalePokemonFrontPokedex.includes(pokedex) && gender === 'female') {
          return `pokemon.front.${pokedex}${shiny}${region}_female`;
        }

        return `pokemon.front.${pokedex}${shiny}${region}`;
    }
  } else {
    switch (type) {
      case 'overworld':
        return `pokemon.overworld.0000`;
      case 'front':
        return `pokemon.front.0000`;
    }
  }
};

export const getPokemonEvolCostText = (targetPokemon: PlayerPokemon, cost: string): [boolean, string] => {
  let split: string[] = cost.split('+') || [];
  let ret = '';
  let check = true;

  for (const target of split) {
    if (target.includes('candy_')) {
      let costCandy = target.split('_')[1];
      if (PlayerGlobal.getData()!.candy < Number(costCandy)) check = false;
      ret = ret + ',' + i18next.t(`menu:candy`) + `(${costCandy})`;
    } else if (target.includes('friendship_')) {
      let costFriendship = target.split('_')[1];
      if (targetPokemon.getFriendShip() < Number(costFriendship)) check = false;
      ret = ret + ',' + i18next.t(`menu:friendship`) + `(${costFriendship})`;
    } else if (target.includes('time_')) {
      let costTime = target.split('_')[1] as 'day' | 'night';
      if (getCurrentTimeOfDay() !== costTime) check = false;
      ret = ret + ',' + i18next.t(`menu:${target}`);
    } else if (target.includes('move_')) {
      let costMove = target.split('_')[1];
      if (!Bag.getItem(costMove)) check = false;
      ret = ret + ',' + i18next.t(`item:${costMove}.name`);
    } else if (target === 'female' || target === 'male') {
      if (targetPokemon.getGender() !== target) check = false;
      ret = ret + ',' + i18next.t(`menu:${target}`);
    } else {
      let costItem = target;
      if (!Bag.getItem(costItem)) check = false;
      ret = ret + ',' + i18next.t(`item:${costItem}.name`);
    }
  }
  ret = replacePercentSymbol(i18next.t('menu:use_evolve'), [ret.slice(1)]);
  return [check, ret];
};

export const getPokemonSkillText = (targetPokemon: PlayerPokemon, skill: string): [boolean, string] => {
  let check = true;
  let ret = skill;

  if (!Bag.getItem(skill)) check = false;
  for (const targetSkill of targetPokemon.getSkill()) {
    if (targetSkill === skill) {
      check = false;
    }
  }

  return [check, ret];
};

export const getTypesSpriteOnSkills = (skill: string) => {
  let type: POKEMON_TYPE = POKEMON_TYPE.NONE;

  switch (skill) {
    case 'move_cut':
    case 'move_flash':
    case 'move_mean-look':
    case 'move_double-hit':
    case 'move_hyper-drill':
    case 'move_mimic':
    case 'move_stomp':
      type = POKEMON_TYPE.NORMAL;
      break;
    case 'move_fly':
    case 'move_defog':
      type = POKEMON_TYPE.FLYING;
      break;
    case 'move_surf':
    case 'move_waterfall':
    case 'move_dive':
      type = POKEMON_TYPE.WATER;
      break;
    case 'move_rock-smash':
    case 'move_strength':
      type = POKEMON_TYPE.FIGHT;
      break;
    case 'move_ancient-power':
    case 'move_rollout':
      type = POKEMON_TYPE.ROCK;
      break;
    case 'move_dragon-pulse':
      type = POKEMON_TYPE.DRAGON;
      break;
    case 'move_taunt':
      type = POKEMON_TYPE.DARK;
      break;
    case 'move_twin-beam':
      type = POKEMON_TYPE.PSYCHIC;
      break;
  }

  return `types-${type}`;
};

export const getItemTexture = (item: string) => {
  switch (item) {
    case 'move_cut':
    case 'move_flash':
      return TEXTURE.HM_NORMAL;
    case 'move_mean-look':
    case 'move_double-hit':
    case 'move_hyper-drill':
    case 'move_mimic':
    case 'move_stomp':
      return TEXTURE.TM_NORMAL;
    case 'move_fly':
      return TEXTURE.HM_FLYING;
    case 'move_defog':
      return TEXTURE.TM_FLYING;
    case 'move_surf':
    case 'move_waterfall':
    case 'move_dive':
      return TEXTURE.HM_WATER;
    case 'move_rock-smash':
    case 'move_strength':
      return TEXTURE.HM_FIGHTING;
    case 'move_ancient-power':
    case 'move_rollout':
      return TEXTURE.TM_ROCK;
    case 'move_dragon-pulse':
      return TEXTURE.TM_DRAGON;
    case 'move_taunt':
      return TEXTURE.TM_DARK;
    case 'move_twin-beam':
      return TEXTURE.TM_PSYCHIC;
    default:
      return item;
  }
};
