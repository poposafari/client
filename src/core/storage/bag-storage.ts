import { MAX_QUICK_ITEM_SLOT } from '../../constants';
import { itemData } from '../../data';
import { ItemCategory } from '../../enums';
import { PlayerItem } from '../../obj/player-item';
import { GetItemRes } from '../../types';
import { SocketIO } from '../manager/socket-manager';

export class BagStorage {
  private static instance: BagStorage;
  private items: Record<string, PlayerItem> = {};

  private pokeballs: Record<string, PlayerItem> = {};
  private berries: Record<string, PlayerItem> = {};
  private keys: Record<string, PlayerItem> = {};
  private etc: Record<string, PlayerItem> = {};

  private slots: (PlayerItem | null)[] = [];

  constructor() {}

  static getInstance(): BagStorage {
    if (!BagStorage.instance) {
      BagStorage.instance = new BagStorage();
    }
    return BagStorage.instance;
  }

  init() {}

  setup(data: GetItemRes[], slots: (GetItemRes | null)[]) {
    this.items = {};
    this.pokeballs = {};
    this.berries = {};
    this.keys = {};
    this.etc = {};
    this.slots = [];

    this.setItems(data);
    for (const item of slots) {
      if (item) {
        this.slots.push(new PlayerItem(item.idx, item.item, item.stock));
      } else {
        this.slots.push(null);
      }
    }
  }

  setItems(data: GetItemRes[]) {
    if (data && data.length > 0) {
      for (const item of data) {
        this.addItems(item.idx, item.item, item.stock, item.category);
      }
    }
  }

  addItems(idx: number, key: string, stock: number = 1, category: ItemCategory) {
    const item = itemData[key];
    if (!item) return;

    const existingItem = this.getItem(key);
    if (existingItem) {
      existingItem.addStock(stock);
      return;
    }

    const obj = new PlayerItem(idx, key, stock);

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

  getSlotItems(): (PlayerItem | null)[] {
    return this.slots;
  }

  clear() {
    this.items = {};
    this.pokeballs = {};
    this.berries = {};
    this.keys = {};
    this.etc = {};
    this.slots = [];
  }

  findSlotItem(item: PlayerItem) {
    for (let i = 0; i < MAX_QUICK_ITEM_SLOT; i++) {
      const slot = this.slots[i];
      if (slot && slot.getKey() === item.getKey()) {
        return [slot, i];
      }
    }

    return [null, null];
  }

  registerSlotItem(item: PlayerItem, idx: number): void {
    if (idx < 0 || idx >= MAX_QUICK_ITEM_SLOT) {
      console.error(`Invalid slot index: ${idx}. Index must be between 0 and ${MAX_QUICK_ITEM_SLOT - 1}.`);
      return;
    }

    const [find, i] = this.findSlotItem(item);
    const newSlotItem = [...this.slots];

    if (find && (i as number) >= 0) {
      newSlotItem[i as number] = null;
    }

    newSlotItem[idx] = item;
    this.slots = newSlotItem;

    SocketIO.changeItemSlot(this.slots.map((slot) => (slot ? slot.getIdx() : null)));
  }

  registerCancelSlotItem(item: PlayerItem) {
    const [find, i] = this.findSlotItem(item);
    const newSlotItem = [...this.slots];

    if (find && (i as number) >= 0) {
      newSlotItem[i as number] = null;
    }

    this.slots = newSlotItem;

    SocketIO.changeItemSlot(this.slots.map((slot) => (slot ? slot.getIdx() : null)));
  }
}

export const Bag = BagStorage.getInstance();
