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

  constructor() {}

  static getInstance(): Bag {
    if (!Bag.instance) {
      Bag.instance = new Bag();
    }
    return Bag.instance;
  }

  setup(data: any) {
    if (data.length > 0) {
      for (const item of data) {
        this.addItems(item.item, item.stock);
      }
    } else {
      this.items = {};
    }
  }

  addItems(key: string, stock: number = 1, register: Register = null) {
    const item = itemData[key];
    if (!item) return;

    const existingItem = this.getItem(key);
    if (existingItem) {
      existingItem.addStock(stock);
      return;
    }

    const obj = new PlayerItem(key, stock, register);

    this.items[key] = obj;
  }

  getItems(): Record<string, PlayerItem> {
    return this.items;
  }

  getItem(key: string): PlayerItem | null {
    return this.items[key] || null;
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

  registerItem(key: string, slot: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9): void {
    const existingItem = this.findItemByRegister(slot);

    if (existingItem) {
      existingItem.registerSlot(null);
    }

    const item = this.getItem(key);
    if (item) {
      item.registerSlot(slot);
    }
  }

  findItemByRegister(slot: Register): PlayerItem | null {
    const Items = [...Object.values(this.items)];
    return Items.find((item) => item.getRegister() === slot) || null;
  }

  private removeItem(key: string) {
    delete this.items[key];
  }

  clearItems() {
    this.items = {};
  }
}
