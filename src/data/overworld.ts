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
};

const initialSafari: Record<string, SafariData> = {
  '011': {
    key: '011',
    cost: 0,
    entryPos: {
      x: 5,
      y: 5,
    },
    area: 'field',
  },
  '012': {
    key: '012',
    cost: 4,
    entryPos: {
      x: 10,
      y: 10,
    },
    area: 'field',
  },
  '013': {
    key: '013',
    cost: 4,
    entryPos: {
      x: 10,
      y: 10,
    },
    area: 'field',
  },
  '014': {
    key: '014',
    cost: 4,
    entryPos: {
      x: 10,
      y: 10,
    },
    area: 'field',
  },
  '015': {
    key: '015',
    cost: 4,
    entryPos: {
      x: 10,
      y: 10,
    },
    area: 'field',
  },
  '016': {
    key: '016',
    cost: 4,
    entryPos: {
      x: 10,
      y: 10,
    },
    area: 'field',
  },
  '017': {
    key: '017',
    cost: 4,
    entryPos: {
      x: 10,
      y: 10,
    },
    area: 'field',
  },
  '018': {
    key: '018',
    cost: 4,
    entryPos: {
      x: 10,
      y: 10,
    },
    area: 'field',
  },
  '019': {
    key: '019',
    cost: 4,
    entryPos: {
      x: 10,
      y: 10,
    },
    area: 'field',
  },
  '020': {
    key: '020',
    cost: 4,
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
