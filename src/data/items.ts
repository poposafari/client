import { ITEM } from '../enums/item';

export interface Item {
  type: ITEM.POKEBALL | ITEM.KEY | ITEM.BERRY | ITEM.ETC;
  price: number;
}

const initial: Record<string, Item> = {
  //dummy
  '000': {
    type: ITEM.ETC,
    price: 0,
  },
  //Poké Ball
  '001': {
    type: ITEM.POKEBALL,
    price: 0,
  },
  //Great Ball
  '002': {
    type: ITEM.POKEBALL,
    price: 0,
  },
  //Ultra Ball
  '003': {
    type: ITEM.POKEBALL,
    price: 0,
  },
  //Master Ball
  '004': {
    type: ITEM.POKEBALL,
    price: 0,
  },
  //bicycle
  '005': {
    type: ITEM.KEY,
    price: 0,
  },
  //ticket
  '006': {
    type: ITEM.KEY,
    price: 0,
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
