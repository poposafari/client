import { itemData } from '../data/items';
import { ITEM } from '../enums/item';
import { PlayerItem, Register } from './player-item';

export class Bag {
  private pokeballs: Record<string, PlayerItem> = {};
  private berries: Record<string, PlayerItem> = {};
  private keys: Record<string, PlayerItem> = {};
  private etc: Record<string, PlayerItem> = {};

  constructor() {}

  setup() {
    this.addItems('001', 4);
    this.addItems('002', 4);
    this.addItems('003', 4);
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

    switch (item.type) {
      case ITEM.POKEBALL:
        this.pokeballs[key] = obj;
        break;
      case ITEM.BERRY:
        this.berries[key] = obj;
        break;
      case ITEM.KEY:
        this.keys[key] = obj;
        break;
      case ITEM.ETC:
        this.etc[key] = obj;
        break;
    }
  }

  getPockets(type: ITEM): Record<string, PlayerItem> {
    switch (type) {
      case ITEM.POKEBALL:
        return this.pokeballs;
      case ITEM.BERRY:
        return this.berries;
      case ITEM.KEY:
        return this.keys;
      case ITEM.ETC:
        return this.etc;
    }
  }

  getItem(key: string): PlayerItem | null {
    return this.pokeballs[key] || this.berries[key] || this.keys[key] || this.etc[key];
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

  private removeItem(key: string) {
    delete this.pokeballs[key];
    delete this.berries[key];
    delete this.keys[key];
    delete this.etc[key];
  }
}
