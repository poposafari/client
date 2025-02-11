import { ITEM } from '../enums/item';

export interface Item {
  key: string;
  type: ITEM.POKEBALL | ITEM.KEY | ITEM.BERRY | ITEM.ETC;
  price: number;
  purchasable: boolean;
}

const initial: Record<string, Item> = {
  //dummy
  '000': {
    key: '000',
    type: ITEM.ETC,
    price: 0,
    purchasable: false,
  },
  //Poké Ball
  '001': {
    key: '001',
    type: ITEM.POKEBALL,
    price: 100,
    purchasable: true,
  },
  //Great Ball
  '002': {
    key: '002',
    type: ITEM.POKEBALL,
    price: 0,
    purchasable: true,
  },
  //Ultra Ball
  '003': {
    key: '003',
    type: ITEM.POKEBALL,
    price: 0,
    purchasable: true,
  },
  //Master Ball
  '004': {
    key: '004',
    type: ITEM.POKEBALL,
    price: 0,
    purchasable: false,
  },
  //bicycle
  '005': {
    key: '005',
    type: ITEM.KEY,
    price: 0,
    purchasable: false,
  },
  //ticket
  '006': {
    key: '006',
    type: ITEM.KEY,
    price: 0,
    purchasable: true,
  },
};

export const itemData = new Proxy(initial, {
  get(target, key: string) {
    if (key in target) {
      return target[key];
    } else {
      console.warn(`Item '${key}' does not exist.`);
      return null;
    }
  },
});

export function getAllItems(): Item[] {
  return Object.values(initial);
}
