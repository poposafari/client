import { itemData } from '../data/items';
import { ITEM } from '../enums/item';
import { PlayerItem, Register } from '../object/player-item';

export class Bag {
  private pokeballs: Record<string, PlayerItem> = {};
  private berries: Record<string, PlayerItem> = {};
  private keys: Record<string, PlayerItem> = {};
  private etc: Record<string, PlayerItem> = {};

  constructor() {}

  setup() {
    this.addItems('001');
    this.addItems('002');
    this.addItems('003');
    this.addItems('004');

    this.addItems('011');
    this.addItems('012');
    this.addItems('013');
    this.addItems('014');
    this.addItems('015');
    this.addItems('016');
    this.addItems('017');
    this.addItems('018');
    this.addItems('019');
    this.addItems('020');
    this.addItems('021');
    this.addItems('022');
    this.addItems('023');
    this.addItems('024');
    this.addItems('025');
    this.addItems('026');
    this.addItems('027');
    this.addItems('028');
    this.addItems('029');

    this.addItems('030', 3);
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
    const allItems = [...Object.values(this.pokeballs), ...Object.values(this.berries), ...Object.values(this.keys), ...Object.values(this.etc)];

    return allItems.find((item) => item.getRegister() === slot) || null;
  }

  private removeItem(key: string) {
    delete this.pokeballs[key];
    delete this.berries[key];
    delete this.keys[key];
    delete this.etc[key];
  }
}
