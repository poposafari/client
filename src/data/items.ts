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
  //오카열매
  '011': {
    key: '011',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //꼬시개열매
  '012': {
    key: '012',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //초나열매
  '013': {
    key: '013',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //린드열매
  '014': {
    key: '014',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //플카열매
  '015': {
    key: '015',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //로플열매
  '016': {
    key: '016',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //으름열매
  '017': {
    key: '017',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //슈캐열매
  '018': {
    key: '018',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //바코열매
  '019': {
    key: '019',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //야파열매
  '020': {
    key: '020',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //리체열매
  '021': {
    key: '021',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //루미열매
  '022': {
    key: '022',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //수불열매
  '023': {
    key: '023',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //하반열매
  '024': {
    key: '024',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //마코열매
  '025': {
    key: '025',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //바리비열매
  '026': {
    key: '026',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //로셀열매
  '027': {
    key: '027',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //카리열매
  '028': {
    key: '028',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //의문열매
  '029': {
    key: '029',
    type: ITEM.BERRY,
    price: 0,
    purchasable: true,
  },
  //티켓
  '030': {
    key: '030',
    type: ITEM.ETC,
    price: 0,
    purchasable: true,
  },
  '046': {
    key: '046',
    type: ITEM.KEY,
    price: 0,
    purchasable: false,
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
