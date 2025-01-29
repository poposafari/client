import i18next from 'i18next';
import { TYPE } from '../enums/type';

export interface Overworld {
  name: string;
  description: string;
  consume: number;
  spawnTypes: TYPE[];
  entryPos: {
    x: number;
    y: number;
  };
}

export let overworlds: Record<string, Overworld> = {};

i18next.on('initialized', () => {
  overworlds = {
    '006': {
      name: i18next.t('menu:overworld_006'),
      description: 'TestRoom',
      consume: 1,
      spawnTypes: [TYPE.GRASS],
      entryPos: {
        x: 19,
        y: 10,
      },
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
