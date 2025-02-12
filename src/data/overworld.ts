import i18next from 'i18next';
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
  spawnTypes: TYPE[];
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
};

const initialSafari: Record<string, SafariData> = {
  '011': {
    key: '011',
    cost: 0,
    spawnTypes: [TYPE.WATER, TYPE.GRASS],
    entryPos: {
      x: 10,
      y: 10,
    },
    area: 'field',
  },
  '012': {
    key: '012',
    cost: 4,
    spawnTypes: [TYPE.WATER, TYPE.GRASS, TYPE.DRAGON],
    entryPos: {
      x: 10,
      y: 10,
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
