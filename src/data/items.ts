import { ITEM, ITEM_USAGE_TYPE } from '../enums/item';
import i18next from '../i18n';

export interface Item {
  name: string;
  description: string;
  type: ITEM.POKEBALL | ITEM.KEY | ITEM.BERRY | ITEM.ETC;
  usageType: ITEM_USAGE_TYPE | string;
}

export let items: Record<string, Item> = {};

i18next.on('initialized', () => {
  items = {
    '000': {
      name: '',
      description: '',
      type: ITEM.ETC,
      usageType: ITEM_USAGE_TYPE.NON_CONSUMABLE,
    },
    '001': {
      name: i18next.t('item:masterball.name'),
      description: i18next.t('item:masterball.description'),
      type: ITEM.POKEBALL,
      usageType: ITEM_USAGE_TYPE.CONSUMABLE,
    },
    '002': {
      name: i18next.t('item:pokeball.name'),
      description: i18next.t('item:pokeball.description'),
      type: ITEM.POKEBALL,
      usageType: ITEM_USAGE_TYPE.CONSUMABLE,
    },
    '003': {
      name: i18next.t('item:greatball.name'),
      description: i18next.t('item:greatball.description'),
      type: ITEM.POKEBALL,
      usageType: ITEM_USAGE_TYPE.CONSUMABLE,
    },
    '004': {
      name: i18next.t('item:ultraball.name'),
      description: i18next.t('item:ultraball.description'),
      type: ITEM.POKEBALL,
      usageType: ITEM_USAGE_TYPE.CONSUMABLE,
    },
    '005': {
      name: i18next.t('item:bicycle.name'),
      description: i18next.t('item:bicycle.description'),
      type: ITEM.KEY,
      usageType: ITEM_USAGE_TYPE.NON_CONSUMABLE,
    },
    '006': {
      name: i18next.t('item:runningshoes.name'),
      description: i18next.t('item:runningshoes.description'),
      type: ITEM.KEY,
      usageType: ITEM_USAGE_TYPE.NON_CONSUMABLE,
    },
    '007': {
      name: i18next.t('item:ticket.name'),
      description: i18next.t('item:ticket.description'),
      type: ITEM.KEY,
      usageType: ITEM_USAGE_TYPE.NON_CONSUMABLE,
    },
  };
});

export function getItem(key: string): Item | null {
  return items[key] || null;
}

export function getItemType(key: string): ITEM | null {
  const ret = getItem(key)?.type;

  if (ret) return ret;

  return null;
}

export function getItemUsageType(key: string) {
  const ret = getItem(key)?.usageType;

  if (ret) return ret;

  return null;
}
