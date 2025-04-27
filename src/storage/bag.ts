import { itemData } from '../data/items';
import { PlayerItem, Register } from '../object/player-item';

export enum ItemCategory {
  POKEBALL = 'pokeball',
  ETC = 'etc',
  BERRY = 'berry',
  KEY = 'key',
}

export class Bag {
  private static instance: Bag;
  private items: Record<string, PlayerItem> = {};

  //category
  private pokeballs: Record<string, PlayerItem> = {};
  private berries: Record<string, PlayerItem> = {};
  private keys: Record<string, PlayerItem> = {};
  private etc: Record<string, PlayerItem> = {};

  constructor() {}

  static getInstance(): Bag {
    if (!Bag.instance) {
      Bag.instance = new Bag();
    }
    return Bag.instance;
  }

  setup(data: any) {
    this.items = {};
    this.pokeballs = {};
    this.berries = {};
    this.keys = {};
    this.etc = {};

    if (data.length > 0) {
      for (const item of data) {
        this.addItems(item.item, item.stock, item.category);
      }
    }
  }

  addItems(key: string, stock: number = 1, category: ItemCategory, register: Register = null) {
    const item = itemData[key];
    if (!item) return;

    const existingItem = this.getItem(key);
    if (existingItem) {
      existingItem.addStock(stock);
      return;
    }

    const obj = new PlayerItem(key, stock, register);

    // this.items[key] = obj;

    switch (category) {
      case ItemCategory.POKEBALL:
        this.pokeballs[key] = obj;
        break;
      case ItemCategory.BERRY:
        this.berries[key] = obj;
        break;
      case ItemCategory.ETC:
        this.etc[key] = obj;
        break;
      case ItemCategory.KEY:
        this.keys[key] = obj;
        break;
    }

    // console.log(this.pokeballs);
    // console.log(this.berries);
    // console.log(this.etc);
    // console.log(this.keys);
  }

  getItems(): Record<string, PlayerItem> {
    return this.items;
  }

  getCategory(category: ItemCategory) {
    switch (category) {
      case ItemCategory.POKEBALL:
        return this.pokeballs;
      case ItemCategory.BERRY:
        return this.berries;
      case ItemCategory.ETC:
        return this.etc;
      case ItemCategory.KEY:
        return this.keys;
    }
  }

  getItem(key: string): PlayerItem | null {
    return this.pokeballs[key] || this.berries[key] || this.keys[key] || this.etc[key];
    // return this.items[key] || null;
  }

  useItem(key: string, useValue: number = 1): boolean {
    const item = this.getItem(key);

    if (!item) return false;

    item.useStock(useValue);

    if (item.getStock() <= 0) {
      this.removeItem(key);
    }

    return true;
  }

  removeItem(key: string) {
    delete this.pokeballs[key];
    delete this.berries[key];
    delete this.keys[key];
    delete this.etc[key];
  }

  clearItems() {
    this.items = {};
  }
}
