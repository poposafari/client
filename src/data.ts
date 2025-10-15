import { BATTLE_AREA, ItemData, NpcData } from './enums';

const initialItemData: Record<string, ItemData> = {
  //dummy
  '000': {
    key: '000',
    usable: false,
    purchasable: false,
    registerable: false,
    price: 10,
  },
  //Master Ball
  '001': {
    key: '001',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 0,
  },
  //Poké Ball
  '002': {
    key: '002',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 10,
  },
  //Great Ball
  '003': {
    key: '003',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 15,
  },
  //Ultra Ball
  '004': {
    key: '004',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 20,
  },
  //오카열매
  '011': {
    key: '011',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //꼬시개열매
  '012': {
    key: '012',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //초나열매
  '013': {
    key: '013',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //린드열매
  '014': {
    key: '014',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //플카열매
  '015': {
    key: '015',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //로플열매
  '016': {
    key: '016',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //으름열매
  '017': {
    key: '017',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //슈캐열매
  '018': {
    key: '018',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //바코열매
  '019': {
    key: '019',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //야파열매
  '020': {
    key: '020',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //리체열매
  '021': {
    key: '021',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //루미열매
  '022': {
    key: '022',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //수불열매
  '023': {
    key: '023',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //하반열매
  '024': {
    key: '024',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //마코열매
  '025': {
    key: '025',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //바리비열매
  '026': {
    key: '026',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //로셀열매
  '027': {
    key: '027',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //카리열매
  '028': {
    key: '028',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //의문열매
  '029': {
    key: '029',
    usable: false,
    purchasable: true,
    registerable: false,
    price: 30,
  },
  //티켓
  '030': {
    key: '030',
    usable: false,
    purchasable: false,
    registerable: false,
    price: 100,
  },
  //비전머신(물)
  '032': {
    key: '032',
    usable: false,
    purchasable: false,
    registerable: false,
    price: 0,
  },
  //비전머신(노말)
  '033': {
    key: '033',
    usable: false,
    purchasable: false,
    registerable: false,
    price: 0,
  },
  //자전거
  '046': {
    key: '046',
    usable: true,
    purchasable: false,
    registerable: true,
    price: 0,
  },
};

export const itemData = new Proxy(initialItemData, {
  get(target, key: string) {
    if (key in target) {
      return target[key];
    } else {
      console.warn(`Item '${key}' does not exist.`);
      return null;
    }
  },
});

export function getAllItems(): ItemData[] {
  return Object.values(initialItemData);
}

export function getItemByKey(key: string): ItemData | null {
  if (key in initialItemData) {
    return initialItemData[key];
  } else {
    console.warn(`Item with key '${key}' does not exist.`);
    return null;
  }
}

const initialNpcData: Record<string, NpcData> = {
  npc000: {
    movable: false,
  },
  npc001: {
    movable: false,
  },
  npc002: {
    movable: false,
  },
};

export const npcData = new Proxy(initialNpcData, {
  get(target, key: string) {
    if (key in target) {
      return target[key];
    } else {
      console.warn(`Npc '${key}' does not exist.`);
      return null;
    }
  },
});

export interface PokemonData {
  offsetY: number;
  shadow: number;
  shadowOffsetX: number;
}

export const females = [3, 12, 19, 20, 25, 26, 41, 42, 44, 45, 64, 65, 84, 85, 97, 111, 112, 118, 119, 123, 129, 130];

export const PokemonData: Record<number, PokemonData> = {
  1: { offsetY: 30, shadow: 0, shadowOffsetX: 0 },
  2: { offsetY: -5, shadow: 1, shadowOffsetX: 0 },
  3: { offsetY: -15, shadow: 2, shadowOffsetX: 0 },
  4: { offsetY: 0, shadow: 0, shadowOffsetX: -10 },
  5: { offsetY: -15, shadow: 1, shadowOffsetX: -15 },
  6: { offsetY: -55, shadow: 2, shadowOffsetX: 0 },
  7: { offsetY: 10, shadow: 0, shadowOffsetX: -5 },
  8: { offsetY: -25, shadow: 1, shadowOffsetX: -5 },
  9: { offsetY: -15, shadow: 2, shadowOffsetX: 0 },
  10: { offsetY: +5, shadow: 0, shadowOffsetX: 0 },
  11: { offsetY: +13, shadow: 0, shadowOffsetX: +10 },
  12: { offsetY: -60, shadow: 1, shadowOffsetX: 0 },
  13: { offsetY: +10, shadow: 0, shadowOffsetX: 0 },
  14: { offsetY: +10, shadow: 0, shadowOffsetX: 0 },
  15: { offsetY: -60, shadow: 1, shadowOffsetX: +10 },
  16: { offsetY: +10, shadow: 0, shadowOffsetX: 0 },
  17: { offsetY: -80, shadow: 1, shadowOffsetX: 0 },
  18: { offsetY: -30, shadow: 2, shadowOffsetX: -20 },
  19: { offsetY: +32, shadow: 1, shadowOffsetX: 0 },
  20: { offsetY: -5, shadow: 1, shadowOffsetX: +20 },
  21: { offsetY: +20, shadow: 0, shadowOffsetX: 0 },
  22: { offsetY: -65, shadow: 1, shadowOffsetX: 0 },
  23: { offsetY: +5, shadow: 1, shadowOffsetX: 0 },
  24: { offsetY: -30, shadow: 2, shadowOffsetX: 0 },
  25: { offsetY: 0, shadow: 0, shadowOffsetX: -15 },
  26: { offsetY: -15, shadow: 1, shadowOffsetX: -15 },
  27: { offsetY: +15, shadow: 0, shadowOffsetX: -5 },
  28: { offsetY: +5, shadow: 1, shadowOffsetX: 0 },
  29: { offsetY: +5, shadow: 0, shadowOffsetX: 0 },
  30: { offsetY: +15, shadow: 1, shadowOffsetX: 0 },
  31: { offsetY: -35, shadow: 2, shadowOffsetX: 0 },
  32: { offsetY: +25, shadow: 0, shadowOffsetX: 0 },
  33: { offsetY: +5, shadow: 1, shadowOffsetX: 0 },
  34: { offsetY: -35, shadow: 2, shadowOffsetX: 0 },
  35: { offsetY: +5, shadow: 0, shadowOffsetX: 0 },
  36: { offsetY: -20, shadow: 1, shadowOffsetX: 0 },
  37: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  38: { offsetY: -35, shadow: 2, shadowOffsetX: 0 },
  39: { offsetY: +15, shadow: 0, shadowOffsetX: +10 },
  40: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  41: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  42: { offsetY: -55, shadow: 1, shadowOffsetX: 0 },
  43: { offsetY: +10, shadow: 0, shadowOffsetX: -10 },
  44: { offsetY: +5, shadow: 0, shadowOffsetX: 0 },
  45: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  46: { offsetY: +50, shadow: 1, shadowOffsetX: -20 },
  47: { offsetY: +10, shadow: 2, shadowOffsetX: 0 },
  48: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  49: { offsetY: -45, shadow: 0, shadowOffsetX: 0 },
  50: { offsetY: +35, shadow: 0, shadowOffsetX: 0 },
  51: { offsetY: +15, shadow: 0, shadowOffsetX: 0 },
  52: { offsetY: -5, shadow: 1, shadowOffsetX: 0 },
  53: { offsetY: -30, shadow: 2, shadowOffsetX: +30 },
  54: { offsetY: +5, shadow: 0, shadowOffsetX: 0 },
  55: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  56: { offsetY: -5, shadow: 1, shadowOffsetX: +10 },
  57: { offsetY: -15, shadow: 2, shadowOffsetX: 0 },
  58: { offsetY: +15, shadow: 1, shadowOffsetX: 0 },
  59: { offsetY: -40, shadow: 2, shadowOffsetX: 0 },
  60: { offsetY: +10, shadow: 0, shadowOffsetX: -10 },
  61: { offsetY: 0, shadow: 1, shadowOffsetX: 0 },
  62: { offsetY: -15, shadow: 2, shadowOffsetX: 0 },
  63: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  64: { offsetY: -15, shadow: 2, shadowOffsetX: 0 },
  65: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  66: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  67: { offsetY: -50, shadow: 1, shadowOffsetX: 0 },
  68: { offsetY: -45, shadow: 2, shadowOffsetX: 0 },
  69: { offsetY: +5, shadow: 0, shadowOffsetX: 0 },
  70: { offsetY: +15, shadow: 1, shadowOffsetX: -30 },
  71: { offsetY: +5, shadow: 2, shadowOffsetX: 0 },
  72: { offsetY: -25, shadow: 1, shadowOffsetX: 0 },
  73: { offsetY: -25, shadow: 2, shadowOffsetX: 0 },
  74: { offsetY: +35, shadow: 1, shadowOffsetX: +10 },
  75: { offsetY: +5, shadow: 1, shadowOffsetX: 0 },
  76: { offsetY: -15, shadow: 2, shadowOffsetX: 0 },
  77: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  78: { offsetY: -45, shadow: 2, shadowOffsetX: 0 },
  79: { offsetY: 0, shadow: 2, shadowOffsetX: 0 },
  80: { offsetY: -30, shadow: 2, shadowOffsetX: 0 },
  81: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  82: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  83: { offsetY: -10, shadow: 0, shadowOffsetX: 0 },
  84: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  85: { offsetY: -40, shadow: 1, shadowOffsetX: 0 },
  86: { offsetY: -10, shadow: 1, shadowOffsetX: 0 },
  87: { offsetY: -45, shadow: 2, shadowOffsetX: 0 },
  88: { offsetY: +20, shadow: 1, shadowOffsetX: 0 },
  89: { offsetY: -15, shadow: 2, shadowOffsetX: 0 },
  90: { offsetY: +20, shadow: 0, shadowOffsetX: 0 },
  91: { offsetY: -20, shadow: 2, shadowOffsetX: 0 },
  92: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  93: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  94: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  95: { offsetY: -45, shadow: 1, shadowOffsetX: +20 },
  96: { offsetY: -15, shadow: 1, shadowOffsetX: +20 },
  97: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  98: { offsetY: +15, shadow: 0, shadowOffsetX: 0 },
  99: { offsetY: -15, shadow: 2, shadowOffsetX: 0 },
  100: { offsetY: +25, shadow: 0, shadowOffsetX: 0 },
  101: { offsetY: -10, shadow: 0, shadowOffsetX: 0 },
  102: { offsetY: +15, shadow: 1, shadowOffsetX: 0 },
  103: { offsetY: -55, shadow: 1, shadowOffsetX: 0 },
  104: { offsetY: +15, shadow: 0, shadowOffsetX: 0 },
  105: { offsetY: +5, shadow: 1, shadowOffsetX: +30 },
  106: { offsetY: -35, shadow: 0, shadowOffsetX: 0 },
  107: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  108: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  109: { offsetY: -25, shadow: 0, shadowOffsetX: 0 },
  110: { offsetY: -35, shadow: 1, shadowOffsetX: 0 },
  111: { offsetY: +5, shadow: 2, shadowOffsetX: 0 },
  112: { offsetY: -35, shadow: 2, shadowOffsetX: 0 },
  113: { offsetY: +5, shadow: 0, shadowOffsetX: 0 },
  114: { offsetY: +5, shadow: 0, shadowOffsetX: 0 },
  115: { offsetY: -25, shadow: 2, shadowOffsetX: 0 },
  116: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  117: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  118: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  119: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  120: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  121: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  122: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  123: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  124: { offsetY: -5, shadow: 2, shadowOffsetX: 0 },
  125: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  126: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  127: { offsetY: -15, shadow: 1, shadowOffsetX: 0 },
  128: { offsetY: -10, shadow: 2, shadowOffsetX: +35 },
  129: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  130: { offsetY: -25, shadow: 2, shadowOffsetX: 0 },
  131: { offsetY: -35, shadow: 2, shadowOffsetX: 0 },
  132: { offsetY: +35, shadow: 1, shadowOffsetX: 0 },
  133: { offsetY: +15, shadow: 0, shadowOffsetX: 0 },
  134: { offsetY: -10, shadow: 1, shadowOffsetX: -10 },
  135: { offsetY: +5, shadow: 1, shadowOffsetX: +10 },
  136: { offsetY: -5, shadow: 1, shadowOffsetX: -10 },
  137: { offsetY: -15, shadow: 0, shadowOffsetX: 0 },
  138: { offsetY: +15, shadow: 0, shadowOffsetX: 0 },
  139: { offsetY: -5, shadow: 1, shadowOffsetX: 0 },
  140: { offsetY: +25, shadow: 0, shadowOffsetX: +5 },
  141: { offsetY: -15, shadow: 1, shadowOffsetX: +20 },
  142: { offsetY: -65, shadow: 1, shadowOffsetX: +10 },
  143: { offsetY: -45, shadow: 2, shadowOffsetX: 0 },
  144: { offsetY: -55, shadow: 2, shadowOffsetX: -25 },
  145: { offsetY: -65, shadow: 2, shadowOffsetX: 0 },
  146: { offsetY: -65, shadow: 2, shadowOffsetX: -25 },
  147: { offsetY: +5, shadow: 0, shadowOffsetX: +10 },
  148: { offsetY: -35, shadow: 2, shadowOffsetX: 0 },
  149: { offsetY: -45, shadow: 2, shadowOffsetX: -30 },
  150: { offsetY: -45, shadow: 2, shadowOffsetX: 0 },
  151: { offsetY: -35, shadow: 0, shadowOffsetX: 0 },
};

export function getPokemonInfo(pokedexNumber: number): PokemonData | null {
  const info = PokemonData[pokedexNumber];
  if (!info) {
    console.warn(`not found Pokemon`);
    return null;
  }
  return info;
}

export interface SafariData {
  key: string;
  cost: number;
  x: number;
  y: number;
  area: BATTLE_AREA;
}

const initialSafariData: Record<string, SafariData> = {
  '021': {
    key: '021',
    cost: 1,
    x: 0,
    y: 0,
    area: BATTLE_AREA.FIELD,
  },
  '022': {
    key: '022',
    cost: 1,
    x: 0,
    y: 0,
    area: BATTLE_AREA.FIELD,
  },
  '023': {
    key: '023',
    cost: 1,
    x: 0,
    y: 0,
    area: BATTLE_AREA.FIELD,
  },
};

export function getAllSafaris(): SafariData[] {
  return Object.values(initialSafariData);
}
export function getSafariByKey(key: string): SafariData | null {
  if (key in initialSafariData) {
    return initialSafariData[key];
  } else {
    console.warn(`Item with key '${key}' does not exist.`);
    return null;
  }
}
