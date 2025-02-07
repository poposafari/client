import { itemData } from '../data/items';

export type Register = null | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export class PlayerItem {
  private key: string;
  private stock: number;
  private register: Register;

  constructor(key: string, stock: number, register: Register) {
    this.key = key;
    this.stock = stock;
    this.register = register;
  }

  getKey() {
    return this.key;
  }

  getStock() {
    return this.stock;
  }

  getRegister() {
    return this.register;
  }

  getInfo() {
    return itemData[this.key];
  }

  addStock(amount: number) {
    this.stock += amount;
  }

  useStock(amount: number) {
    this.stock -= amount;
  }

  registerSlot(slot: null | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    this.register = slot;
  }
}
