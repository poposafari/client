import i18next from 'i18next';
import { pokemon } from '../locales/ko/pokemon';
import { GroundItemObject } from '../object/ground-item-object';
import { NpcObject } from '../object/npc-object';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { GroundItemInfo, PokemonGender, PokemonSkill, PokemonSpawn, WildPokemonInfo } from '../types';
import { Overworld } from '../uis/overworld/overworld';
import { OverworldUi } from '../uis/overworld/overworld-ui';

export class OverworldInfo {
  private static instance: OverworldInfo;

  private maps: Map<string, Overworld> = new Map<string, Overworld>();

  private key!: string;
  private npcs: NpcObject[] = [];
  private pokemoninfo: WildPokemonInfo[] = [];
  private pokemons: PokemonObject[] = [];
  private groundItemInfo: GroundItemInfo[] = [];
  private groundItems: GroundItemObject[] = [];

  constructor() {}

  static getInstance(): OverworldInfo {
    if (!OverworldInfo.instance) {
      OverworldInfo.instance = new OverworldInfo();
    }
    return OverworldInfo.instance;
  }

  registerMap(key: string, value: Overworld) {
    this.maps.set(key, value);
  }

  getMap(key: string) {
    return this.maps.get(key);
  }

  setupWildPokemonInfo(data: WildPokemonInfo[]) {
    this.pokemoninfo = [];
    this.pokemoninfo = data;

    console.log(this.pokemoninfo);
  }

  setupGroundItemInfo(data: GroundItemInfo[] | null) {
    if (data) {
      this.groundItemInfo = [];
      this.groundItemInfo = data;
    }
  }

  getWildPokemonInfo() {
    return this.pokemoninfo;
  }

  getGroundItemInfo() {
    return this.groundItemInfo;
  }

  addNpc(obj: NpcObject) {
    this.npcs.push(obj);
  }

  getNpcs() {
    return this.npcs;
  }

  getKey() {
    return this.key;
  }

  setKey(key: string) {
    this.key = key;
  }

  resetNpcs() {
    for (const npc of this.npcs) {
      npc.destroy();
    }

    this.npcs = [];
  }

  addPokemon(pokemon: PokemonObject) {
    this.pokemons.push(pokemon);
  }

  getPokemons() {
    return this.pokemons;
  }

  resetPokemons() {
    this.pokemons = [];
  }

  addGroundItem(obj: GroundItemObject) {
    this.groundItems.push(obj);
  }

  getGroundItems() {
    return this.groundItems;
  }

  resetGroundItem() {
    this.groundItems = [];
  }
}
