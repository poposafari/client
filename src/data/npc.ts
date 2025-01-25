import i18next from '../i18n';
import { Message } from '../interface/sys';

export interface Npc {
  movable: boolean;
  scripts: Record<string, Message[]>;
}

export let npcsInfo: Record<string, Npc> = {};

i18next.on('initialized', () => {
  npcsInfo = {
    npc000: {
      movable: false,
      scripts: {
        talk: [{ type: 'default', format: 'talk', content: i18next.t('message:npc000_welcome') }],
        question: [{ type: 'default', format: 'question', content: i18next.t('message:npc000_question') }],
      },
    },
  };
});
