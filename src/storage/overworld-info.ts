import { NpcObject } from '../object/npc-object';
import { PokemonObject } from '../object/pokemon-object';

export class OverworldInfo {
  private npcs: NpcObject[] = [];
  private pokemons: PokemonObject[] = [];

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

  addPokemon(obj: PokemonObject) {
    this.pokemons.push(obj);
  }

  getPokemons() {
    return this.pokemons;
  }

  resetPokemons() {
    this.pokemons = [];
  }
}
