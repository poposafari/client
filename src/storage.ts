import { GM } from './core/game-manager';
import { itemData } from './data';
import { ItemCategory } from './enums';
import { DoorOverworldObj } from './obj/door-overworld-obj';
import { GroundItemOverworldObj } from './obj/ground-item-overworld-obj';
import { NpcOverworldObj } from './obj/npc-overworld-obj';
import { OtherPlayerOverworldObj } from './obj/other-player-overworld-obj';
import { PlayerItem } from './obj/player-item';
import { WildOverworldObj } from './obj/wild-overworld-obj';
// import { GroundItemObject } from './object-legacy/ground-item-object';
// import { PokemonObject } from './object-legacy/pokemon-object';
import { GetItemRes, GroundItemInfo, GroundItemRes, OverworldStatue, WildPokemonInfo, WildRes, SocketInitData, MovementPlayer, OtherPlayerInfo, OtherPlayerExitRes, PlayerMovementRes } from './types';
import { Overworld } from './uis/overworld';

export class BagStorage {
  private static instance: BagStorage;
  private items: Record<string, PlayerItem> = {};

  //category
  private pokeballs: Record<string, PlayerItem> = {};
  private berries: Record<string, PlayerItem> = {};
  private keys: Record<string, PlayerItem> = {};
  private etc: Record<string, PlayerItem> = {};

  constructor() {}

  static getInstance(): BagStorage {
    if (!BagStorage.instance) {
      BagStorage.instance = new BagStorage();
    }
    return BagStorage.instance;
  }

  setup(data: any) {
    this.items = {};
    this.pokeballs = {};
    this.berries = {};
    this.keys = {};
    this.etc = {};

    // console.log(data);

    if (data && data.length > 0) {
      for (const item of data) {
        this.addItems(item.idx, item.item, item.stock, item.category);
      }
    }

    // console.log(this.pokeballs);
    // console.log(this.berries);
    // console.log(this.etc);
    // console.log(this.keys);
  }

  setItems(data: GetItemRes[]) {
    // console.log(data);

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
      existingItem.setStock(stock);
      return;
    }

    const obj = new PlayerItem(idx, key, stock);

    // this.items[key] = obj;

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

    // console.log(this.pokeballs);
    // console.log(this.berries);
    // console.log(this.etc);
    // console.log(this.keys);
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
    // return this.items[key] || null;
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

  clearItems() {
    this.items = {};
  }
}

export class OverworldStorage {
  private static instance: OverworldStorage;

  private maps: Map<string, Overworld> = new Map<string, Overworld>();
  private scene: any = null;

  private blockingUpdate: boolean = false;

  private key!: string;
  private npcs: NpcOverworldObj[] = [];
  private doors: DoorOverworldObj[] = [];
  private statue: OverworldStatue[] = [];

  private wilds: WildOverworldObj[] = [];
  private wildData: WildRes[] = [];
  private groundItems: GroundItemOverworldObj[] = [];
  private groundItemData: GroundItemRes[] = [];

  private otherPlayersInfo: OtherPlayerInfo[] = [];
  private otherPlayersExitInfo: OtherPlayerExitRes[] = [];
  private otherPlayersMovementInfo: PlayerMovementRes[] = [];

  constructor() {}

  static getInstance(): OverworldStorage {
    if (!OverworldStorage.instance) {
      OverworldStorage.instance = new OverworldStorage();
    }
    return OverworldStorage.instance;
  }

  getBlockingUpdate() {
    return this.blockingUpdate;
  }

  setBlockingUpdate(onoff: boolean) {
    this.blockingUpdate = onoff;
  }

  setScene(scene: any): void {
    this.scene = scene;
  }

  registerMap(key: string, value: Overworld) {
    this.maps.set(key, value);
  }

  getMap(key: string) {
    return this.maps.get(key);
  }

  setupWildData(data: WildRes[]) {
    this.wildData = [];
    this.wildData = data;
  }

  setupGroundItemInfo(data: GroundItemRes[]) {
    this.groundItemData = [];
    this.groundItemData = data;
  }

  getWildData() {
    return this.wildData;
  }

  getGroundItemData() {
    return this.groundItemData;
  }

  addNpc(obj: NpcOverworldObj) {
    this.npcs.push(obj);
  }

  getNpcs() {
    return this.npcs;
  }

  getDoors() {
    return this.doors;
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

  getWilds() {
    return this.wilds;
  }

  addWild(wild: WildOverworldObj) {
    this.wilds.push(wild);
  }

  resetWilds() {
    this.wilds = [];
  }

  addGroundItem(obj: GroundItemOverworldObj) {
    this.groundItems.push(obj);
  }

  getGroundItems() {
    return this.groundItems;
  }

  resetGroundItems() {
    this.groundItems = [];
  }

  addDoor(door: DoorOverworldObj) {
    this.doors.push(door);
  }

  resetDoor() {
    for (const door of this.doors) {
      door.destroy();
    }

    this.doors = [];
  }

  addStatue(obj: OverworldStatue) {
    this.statue.push(obj);
  }

  resetStatue() {
    for (const statue of this.statue) {
      statue.destroy();
    }

    this.statue = [];
  }

  getStatue() {
    return this.statue;
  }

  getOtherplayerInfo() {
    return this.otherPlayersInfo;
  }

  cleanOtherplayerInfo() {
    this.otherPlayersInfo = [];
  }

  addOtherplayerInfo(data: OtherPlayerInfo) {
    this.otherPlayersInfo.push(data);
  }

  shiftOtherplayerInfo() {
    return this.otherPlayersInfo.shift();
  }

  getOtherplayerMovementInfo() {
    return this.otherPlayersMovementInfo;
  }

  cleanOtherplayerMovementInfo() {
    this.otherPlayersMovementInfo = [];
  }

  addOtherplayerMovementInfo(data: PlayerMovementRes) {
    this.otherPlayersMovementInfo.push(data);
  }

  shiftOtherplayerMovementInfo() {
    return this.otherPlayersMovementInfo.shift();
  }

  getOtherplayerExitInfo() {
    return this.otherPlayersExitInfo;
  }

  cleanOtherplayerExitInfo() {
    this.otherPlayersExitInfo = [];
  }

  addOtherplayerExitInfo(data: OtherPlayerExitRes) {
    this.otherPlayersExitInfo.push(data);
  }

  shiftOtherplayerExitInfo() {
    return this.otherPlayersExitInfo.shift();
  }
}
