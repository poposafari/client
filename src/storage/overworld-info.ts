import { NpcObject } from '../object/npc-object';
import { PokemonObject } from '../object/pokemon-object';

export class OverworldInfo {
  private npcs: NpcObject[] = [];

  constructor() {}

  addNpc(obj: NpcObject) {
    this.npcs.push(obj);
  }

  getNpcs() {
    return this.npcs;
  }

  resetNpcs() {
    this.npcs = [];
  }
}
