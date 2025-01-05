import i18next from 'i18next';
import { TYPE } from '../enums/type';

export interface Overworld {
  name: string;
  description: string;
  consume: number;
  spawnTypes: TYPE[];
}

export let overworlds: Record<string, Overworld> = {};

i18next.on('initialized', () => {
  overworlds = {
    '000': {
      name: i18next.t('menu:overworld_000'),
      description: 'TestRoom',
      consume: 0,
      spawnTypes: [TYPE.DRAGON, TYPE.ELECTRIC],
    },
    '001': {
      name: i18next.t('menu:overworld_001'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE],
    },
    '002': {
      name: i18next.t('menu:overworld_002'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER, TYPE.FAIRY],
    },
    '003': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER, TYPE.FAIRY, TYPE.GHOST],
    },
    '004': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
    '005': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
    '006': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
    '007': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
    '008': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
    '009': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
    '010': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
    '011': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
    '012': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
    '013': {
      name: i18next.t('menu:overworld_003'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.FIRE, TYPE.FLYING, TYPE.BUG, TYPE.WATER],
    },
  };
});

export function getOverworlds(): string[] {
  return Object.keys(overworlds);
}

export function getOverworldInfo(key: string): Overworld | null {
  if (overworlds[key]) {
    return overworlds[key];
  }
  return null;
}
