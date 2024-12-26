import { ITEM } from '../enums/item';
import i18next from '../i18n';

export interface Item {
  name: string;
  description: string;
  type: ITEM.POKEBALL | ITEM.KEY | ITEM.BERRY | ITEM.ETC;
  detail: string;
}

export let items: Record<string, Item> = {};

i18next.on('initialized', () => {
  items = {
    '000': {
      name: '',
      description: '',
      type: ITEM.ETC,
      detail: '',
    },
    '001': {
      name: i18next.t('item:masterball.name'),
      description: i18next.t('item:masterball.description'),
      type: ITEM.POKEBALL,
      detail: '',
    },
    '002': {
      name: i18next.t('item:pokeball.name'),
      description: i18next.t('item:pokeball.description'),
      type: ITEM.POKEBALL,
      detail: '',
    },
    '003': {
      name: i18next.t('item:greatball.name'),
      description: i18next.t('item:greatball.description'),
      type: ITEM.POKEBALL,
      detail: '',
    },
    '004': {
      name: i18next.t('item:ultraball.name'),
      description: i18next.t('item:ultraball.description'),
      type: ITEM.POKEBALL,
      detail: '',
    },
    '005': {
      name: i18next.t('item:bicycle.name'),
      description: i18next.t('item:bicycle.description'),
      type: ITEM.KEY,
      detail: 'ride',
    },
  };
});

export function getItem(key: string): Item | null {
  return items[key] || null;
}

export function getItemType(key: string): string | null {
  const targetItemInfo = getItem(key);
  const type = targetItemInfo?.type;

  switch (type) {
    case ITEM.KEY:
      if (targetItemInfo?.detail) return targetItemInfo.detail;
      break;
  }

  return null;
}
