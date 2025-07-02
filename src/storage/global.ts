import { itemData } from '../data/items';
import { PlayerItem, Register } from '../object/player-item';

export class Global {
  private static instance: Global;
  private startEvolve: string = `pokemon_sprite0000`;
  private startPokedex: string = '0000';
  private nextEvolve: string | null = `pokemon_sprite0000`;
  private nextPokedex: string = '0000';

  constructor() {}

  static getInstance(): Global {
    if (!Global.instance) {
      Global.instance = new Global();
    }
    return Global.instance;
  }

  setEvolveData(start: string, pokedex_s: string, next: string | null, pokedex_n: string) {
    this.startEvolve = start;
    this.nextEvolve = next;
    this.startPokedex = pokedex_s;
    this.nextPokedex = pokedex_n;
  }

  getEvolveData() {
    return [this.startEvolve, this.nextEvolve, this.startPokedex, this.nextPokedex];
  }
}
