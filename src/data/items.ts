import i18next from '../i18n';

export interface Item {
  name: string;
  description: string;
  type: 'pokeball' | 'berry' | 'key' | 'use';
}

export let items: Record<string, Item> = {};

i18next.on('initialized', () => {
  items = {
    '000': {
      name: '',
      description: '',
      type: 'use',
    },
    '001': {
      name: i18next.t('item:masterball.name'),
      description: i18next.t('item:masterball.description'),
      type: 'pokeball',
    },
    '002': {
      name: i18next.t('item:pokeball.name'),
      description: i18next.t('item:pokeball.description'),
      type: 'pokeball',
    },
    '003': {
      name: i18next.t('item:greatball.name'),
      description: i18next.t('item:greatball.description'),
      type: 'pokeball',
    },
    '004': {
      name: i18next.t('item:ultraball.name'),
      description: i18next.t('item:ultraball.description'),
      type: 'pokeball',
    },
    '005': {
      name: i18next.t('item:bicycle.name'),
      description: i18next.t('item:bicycle.description'),
      type: 'key',
    },
  };
});

export function getItem(key: string): Item | null {
  return items[key] || null;
}
