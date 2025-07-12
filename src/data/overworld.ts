import { OVERWORLD_TYPE } from '../enums/overworld-type';
import { TYPE } from '../enums/type';

export interface PlazaData {
  entryPos: {
    x: number;
    y: number;
  };
}

export interface SafariData {
  key: string;
  cost: number;
  entryPos: {
    x: number;
    y: number;
  };
  area: string;
}

const initialPlaza: Record<string, PlazaData> = {
  '000': {
    entryPos: {
      x: 10,
      y: 10,
    },
  },
  '001': {
    entryPos: {
      x: 0,
      y: 0,
    },
  },
  '002': {
    entryPos: {
      x: 0,
      y: 0,
    },
  },
};

const initialSafari: Record<string, SafariData> = {
  '021': {
    key: '021',
    cost: 0,
    entryPos: {
      x: 5,
      y: 5,
    },
    area: 'field',
  },
};

export const safariData = new Proxy(initialSafari, {
  get(target, key: string) {
    if (key in target) {
      return target[key];
    } else {
      console.warn(`Npc '${key}' does not exist.`);
      return null;
    }
  },
  set() {
    console.warn('Data modification is not allowed.');
    return false;
  },
});

export function getAllSafaris(): SafariData[] {
  return Object.values(initialSafari);
}

export function getSafari(key: string) {
  return initialSafari[key];
}

export function checkOverworldType(type: string): OVERWORLD_TYPE {
  if (type in initialPlaza) {
    return OVERWORLD_TYPE.PLAZA;
  } else if (type in initialSafari) {
    return OVERWORLD_TYPE.SAFARI;
  } else {
    return OVERWORLD_TYPE.NONE;
  }
}
