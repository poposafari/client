import i18next from '../i18n';
import { Message } from '../interface/sys';

export interface Npc {
  movable: boolean;
  scripts: Message[];
}

export let npcs: Record<string, Npc> = {};

i18next.on('initialized', () => {
  npcs = {
    '000': {
      movable: false,
      scripts: [],
    },
  };
});
