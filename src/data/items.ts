import { ITEM } from '../enums/item';

export interface Item {
  key: string;
  usable: boolean;
  purchasable: boolean;
  price: number;
}

const initial: Record<string, Item> = {
  //dummy
  '000': {
    key: '000',
    usable: false,
    purchasable: false,
    price: 10,
  },
  //Master Ball
  '001': {
    key: '001',
    usable: false,
    purchasable: false,
    price: 0,
  },
  //Poké Ball
  '002': {
    key: '002',
    usable: false,
    purchasable: true,
    price: 10,
  },
  //Great Ball
  '003': {
    key: '003',
    usable: false,
    purchasable: true,
    price: 15,
  },
  //Ultra Ball
  '004': {
    key: '004',
    usable: false,
    purchasable: true,
    price: 20,
  },
  //오카열매
  '011': {
    key: '011',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //꼬시개열매
  '012': {
    key: '012',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //초나열매
  '013': {
    key: '013',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //린드열매
  '014': {
    key: '014',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //플카열매
  '015': {
    key: '015',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //로플열매
  '016': {
    key: '016',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //으름열매
  '017': {
    key: '017',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //슈캐열매
  '018': {
    key: '018',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //바코열매
  '019': {
    key: '019',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //야파열매
  '020': {
    key: '020',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //리체열매
  '021': {
    key: '021',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //루미열매
  '022': {
    key: '022',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //수불열매
  '023': {
    key: '023',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //하반열매
  '024': {
    key: '024',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //마코열매
  '025': {
    key: '025',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //바리비열매
  '026': {
    key: '026',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //로셀열매
  '027': {
    key: '027',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //카리열매
  '028': {
    key: '028',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //의문열매
  '029': {
    key: '029',
    usable: false,
    purchasable: true,
    price: 30,
  },
  //티켓
  '030': {
    key: '030',
    usable: false,
    purchasable: true,
    price: 100,
  },
  //비전머신(물)
  '032': {
    key: '032',
    usable: true,
    purchasable: false,
    price: 0,
  },
  //비전머신(노말)
  '033': {
    key: '033',
    usable: true,
    purchasable: false,
    price: 0,
  },
  //자전거
  '046': {
    key: '046',
    usable: true,
    purchasable: false,
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

export function getAllItems(): Item[] {
  return Object.values(initial);
}

export function getItemByKey(key: string): Item | null {
  if (key in initial) {
    return initial[key];
  } else {
    console.warn(`Item with key '${key}' does not exist.`);
    return null;
  }
}
