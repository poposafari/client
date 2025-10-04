import { itemData } from '../data';

export class PlayerItem {
  private idx: number;
  private key: string;
  private stock: number;

  constructor(idx: number, key: string, stock: number) {
    this.idx = idx;
    this.key = key;
    this.stock = stock;
  }

  getIdx() {
    return this.idx;
  }

  getKey() {
    return this.key;
  }

  getStock() {
    return this.stock;
  }

  getInfo() {
    return itemData[this.key];
  }

  addStock(amount: number) {
    this.stock += amount;
  }

  setStock(value: number) {
    this.stock = value;
  }

  useStock(amount: number) {
    this.stock -= amount;
  }
}
