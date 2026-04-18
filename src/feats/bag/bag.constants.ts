import { ItemCategory } from '@poposafari/types';

export const BAG_CATEGORIES: ItemCategory[] = ['pokeball', 'candy', 'etc', 'tms_hms', 'key'];

export interface BagAction {
  key: 'give' | 'use' | 'register' | 'deregister' | 'cancel';
  i18n: string;
}

export const BAG_ACTIONS: Record<ItemCategory, BagAction[]> = {
  pokeball: [
    { key: 'give', i18n: 'bag:action.give' },
    { key: 'cancel', i18n: 'bag:action.cancel' },
  ],
  candy: [
    { key: 'give', i18n: 'bag:action.give' },
    { key: 'cancel', i18n: 'bag:action.cancel' },
  ],
  etc: [
    { key: 'give', i18n: 'bag:action.give' },
    { key: 'cancel', i18n: 'bag:action.cancel' },
  ],
  tms_hms: [
    { key: 'use', i18n: 'bag:action.use' },
    { key: 'give', i18n: 'bag:action.give' },
    { key: 'cancel', i18n: 'bag:action.cancel' },
  ],
  key: [
    { key: 'use', i18n: 'bag:action.use' },
    { key: 'register', i18n: 'bag:action.register' },
    { key: 'deregister', i18n: 'bag:action.deregister' },
    { key: 'cancel', i18n: 'bag:action.cancel' },
  ],
};
