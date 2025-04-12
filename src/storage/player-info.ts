import { HttpStatusCode } from 'axios';
import { ingameApi, nicknameApi } from '../utils/axios';
import { MyPokemon } from './box';

export const MAX_PARTY_SLOT = 6;
export const MAX_ITEM_SLOT = 9;

export type PlayerGender = 'boy' | 'girl';
export type PlayerAvatar = '1' | '2' | '3' | '4';
export type PokeBoxBG = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18';

export interface Location {
  overworld: string;
  x: number;
  y: number;
}

export class PlayerInfo {
  private static instance: PlayerInfo;

  private nickname!: string;
  private gender!: PlayerGender;
  private avatar!: PlayerAvatar;
  private location!: string;
  private x!: number;
  private y!: number;
  private money!: number;

  private pet!: MyPokemon | null;
  private partySlot: (MyPokemon | null)[] = [];
  private itemSlot: (string | null)[] = [];
  private pokeboxBg: PokeBoxBG[] = [];

  private readonly MaxSlot: number = 6;

  constructor() {}

  static getInstance(): PlayerInfo {
    if (!PlayerInfo.instance) {
      PlayerInfo.instance = new PlayerInfo();
    }
    return PlayerInfo.instance;
  }

  setup(data: any) {
    if (!data) throw new Error('Player data is required');

    console.log(data);

    this.nickname = data.nickname;
    this.gender = data.gender;
    this.avatar = data.avatar;
    this.location = data.location;
    this.x = data.x;
    this.y = data.y;
    this.money = data.money;

    //item slots
    this.itemSlot[0] = data.itemSlot.slot1;
    this.itemSlot[1] = data.itemSlot.slot2;
    this.itemSlot[2] = data.itemSlot.slot3;
    this.itemSlot[3] = data.itemSlot.slot4;
    this.itemSlot[4] = data.itemSlot.slot5;
    this.itemSlot[5] = data.itemSlot.slot6;
    this.itemSlot[6] = data.itemSlot.slot7;
    this.itemSlot[7] = data.itemSlot.slot8;
    this.itemSlot[8] = data.itemSlot.slot9;
  }

  getItemSlot() {
    return this.itemSlot;
  }

  setItemSlot(slot: number, item: string | null) {
    if (slot < 0 || slot >= MAX_ITEM_SLOT) {
      throw new Error('Invalid item slot index');
    }

    const find = this.findItemSlot(item);

    if (find !== null) {
      this.itemSlot[find] = null;
    }

    this.itemSlot[slot] = item;
  }

  findItemSlot(item: string | null): number | null {
    for (let i = 0; i < MAX_ITEM_SLOT; i++) {
      if (this.itemSlot[i] === item) {
        return i as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
      }
    }

    return null;
  }

  getNickname() {
    return this.nickname;
  }

  getGender() {
    return this.gender;
  }

  getAvatar() {
    return this.avatar;
  }

  getLocation() {
    return this.location;
  }

  getPosX() {
    return this.x;
  }

  getPosY() {
    return this.y;
  }

  getPet() {
    return this.pet;
  }

  getMoney() {
    return this.money;
  }

  setNickname(nickname: string) {
    this.nickname = nickname;
  }

  setGender(gender: PlayerGender) {
    this.gender = gender;
  }

  setAvatar(avatar: PlayerAvatar) {
    this.avatar = avatar;
  }

  setLocation(location: string) {
    this.location = location;
  }

  setX(x: number) {
    this.x = x;
  }
  setY(y: number) {
    this.y = y;
  }

  setPet(pet: MyPokemon | null) {
    this.pet = pet;
  }

  setMoney(money: number) {
    this.money = money;
  }

  useMoney(cost: number) {
    if (cost && this.money < cost) {
      return false;
    }

    this.setMoney(this.money - cost);
    return true;
  }

  getPartySlot() {
    return this.partySlot;
  }

  addPartySlot(pokemon: MyPokemon): boolean {
    if (this.partySlot.length === this.MaxSlot) {
      return false;
    }

    this.partySlot.push(pokemon);

    return true;
  }

  hasPartySlot(pokemon: MyPokemon) {
    return this.partySlot.includes(pokemon);
  }

  removePartSlot(pokemon: MyPokemon): boolean {
    const index = this.partySlot.indexOf(pokemon);

    if (index !== -1) {
      this.partySlot.splice(index, 1);
      return true;
    }

    return false;
  }
}
