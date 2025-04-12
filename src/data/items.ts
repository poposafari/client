import { ITEM } from '../enums/item';

export interface Item {
  key: string;
  registerable: boolean;
  usable: boolean;
}

const initial: Record<string, Item> = {
  //dummy
  '000': {
    key: '000',
    registerable: false,
    usable: false,
  },
  //Poké Ball
  '001': {
    key: '001',
    registerable: false,
    usable: false,
  },
  //Great Ball
  '002': {
    key: '002',
    registerable: false,
    usable: false,
  },
  //Ultra Ball
  '003': {
    key: '003',
    registerable: false,
    usable: false,
  },
  //Master Ball
  '004': {
    key: '004',
    registerable: false,
    usable: false,
  },
  //오카열매
  '011': {
    key: '011',
    registerable: false,
    usable: false,
  },
  //꼬시개열매
  '012': {
    key: '012',
    registerable: false,
    usable: false,
  },
  //초나열매
  '013': {
    key: '013',
    registerable: false,
    usable: false,
  },
  //린드열매
  '014': {
    key: '014',
    registerable: false,
    usable: false,
  },
  //플카열매
  '015': {
    key: '015',
    registerable: false,
    usable: false,
  },
  //로플열매
  '016': {
    key: '016',
    registerable: false,
    usable: false,
  },
  //으름열매
  '017': {
    key: '017',
    registerable: false,
    usable: false,
  },
  //슈캐열매
  '018': {
    key: '018',
    registerable: false,
    usable: false,
  },
  //바코열매
  '019': {
    key: '019',
    registerable: false,
    usable: false,
  },
  //야파열매
  '020': {
    key: '020',
    registerable: false,
    usable: false,
  },
  //리체열매
  '021': {
    key: '021',
    registerable: false,
    usable: false,
  },
  //루미열매
  '022': {
    key: '022',
    registerable: false,
    usable: false,
  },
  //수불열매
  '023': {
    key: '023',
    registerable: false,
    usable: false,
  },
  //하반열매
  '024': {
    key: '024',
    registerable: false,
    usable: false,
  },
  //마코열매
  '025': {
    key: '025',
    registerable: false,
    usable: false,
  },
  //바리비열매
  '026': {
    key: '026',
    registerable: false,
    usable: false,
  },
  //로셀열매
  '027': {
    key: '027',
    registerable: false,
    usable: false,
  },
  //카리열매
  '028': {
    key: '028',
    registerable: false,
    usable: false,
  },
  //의문열매
  '029': {
    key: '029',
    registerable: false,
    usable: false,
  },
  //티켓
  '030': {
    key: '030',
    registerable: false,
    usable: false,
  },
  //자전거
  '046': {
    key: '046',
    registerable: true,
    usable: true,
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
