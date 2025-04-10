import { ITEM } from '../enums/item';

export interface Item {
  key: string;
}

const initial: Record<string, Item> = {
  //dummy
  '000': {
    key: '000',
  },
  //Poké Ball
  '001': {
    key: '001',
  },
  //Great Ball
  '002': {
    key: '002',
  },
  //Ultra Ball
  '003': {
    key: '003',
  },
  //Master Ball
  '004': {
    key: '004',
  },
  //오카열매
  '011': {
    key: '011',
  },
  //꼬시개열매
  '012': {
    key: '012',
  },
  //초나열매
  '013': {
    key: '013',
  },
  //린드열매
  '014': {
    key: '014',
  },
  //플카열매
  '015': {
    key: '015',
  },
  //로플열매
  '016': {
    key: '016',
  },
  //으름열매
  '017': {
    key: '017',
  },
  //슈캐열매
  '018': {
    key: '018',
  },
  //바코열매
  '019': {
    key: '019',
  },
  //야파열매
  '020': {
    key: '020',
  },
  //리체열매
  '021': {
    key: '021',
  },
  //루미열매
  '022': {
    key: '022',
  },
  //수불열매
  '023': {
    key: '023',
  },
  //하반열매
  '024': {
    key: '024',
  },
  //마코열매
  '025': {
    key: '025',
  },
  //바리비열매
  '026': {
    key: '026',
  },
  //로셀열매
  '027': {
    key: '027',
  },
  //카리열매
  '028': {
    key: '028',
  },
  //의문열매
  '029': {
    key: '029',
  },
  //티켓
  '030': {
    key: '030',
  },
  //자전거
  '046': {
    key: '046',
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
