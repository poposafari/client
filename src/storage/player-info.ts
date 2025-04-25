import { HttpStatusCode } from 'axios';
import { ingameApi, nicknameApi } from '../utils/axios';
import { MyPokemon } from './box';
import { getPartyKey } from '../utils/string-util';

export const MAX_PARTY_SLOT = 6;
export const MAX_ITEM_SLOT = 9;
export const MAX_POKEBOXBG_SLOT = 33;

export type PlayerGender = 'boy' | 'girl';
export type PlayerAvatar = '1' | '2' | '3' | '4';
export type PokeBoxBG = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15';

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
  private candy!: number;

  private pet!: string | null;
  private partySlot: (string | null)[] = [];
  private itemSlot: (string | null)[] = [];
  private pokeboxBg: PokeBoxBG[] = [];
  private pokeboxBgCopy: PokeBoxBG[] = [];

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
    this.candy = data.money;

    //party
    this.partySlot = data.party;

    //itemslot
    this.itemSlot = data.itemslot;

    //pokebox
    this.pokeboxBg = data.boxes;

    this.copyPokeboxBg('origin', 'copy');
  }

  copyPokeboxBg(from: 'origin' | 'copy', to: 'origin' | 'copy') {
    if (from === 'origin' && to === 'copy') this.pokeboxBgCopy = [...this.pokeboxBg];
    else if (from === 'copy' && to === 'origin') this.pokeboxBg = [...this.pokeboxBgCopy];
  }

  isPokeboxBgEqual(): boolean {
    if (this.pokeboxBg.length !== this.pokeboxBgCopy.length) return false;

    for (let i = 0; i < this.pokeboxBg.length; i++) {
      if (this.pokeboxBg[i] !== this.pokeboxBgCopy[i]) return false;
    }

    return true;
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

  getCandy() {
    return this.candy;
  }

  getPokeboxBg() {
    return this.pokeboxBgCopy;
  }

  setPokeboxBg(target: PokeBoxBG[]) {
    if (target) {
      this.pokeboxBgCopy = [...target];
    }
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

  setPet(pet: string | null) {
    this.pet = pet;
  }

  setCandy(candy: number) {
    this.candy = candy;
  }

  useCandy(cost: number) {
    if (cost && this.candy < cost) {
      return false;
    }

    this.setCandy(this.candy - cost);
    return true;
  }

  getPartySlot() {
    return this.partySlot;
  }

  addPartySlot(pokemon: MyPokemon): boolean {
    const key = getPartyKey(pokemon);

    if (this.partySlot.length >= MAX_PARTY_SLOT) {
      return false;
    }

    for (const party of this.partySlot) {
      if (key === party) return false;
    }

    this.partySlot.push(key);
    console.log(this.partySlot);

    return true;
  }

  hasPartySlot(pokemon: MyPokemon) {
    return this.partySlot.includes(getPartyKey(pokemon));
  }

  removePartSlot(pokemon: MyPokemon | null, idx?: number): boolean {
    const index = idx !== undefined && idx >= 0 ? idx : this.partySlot.indexOf(getPartyKey(pokemon));

    if (index !== -1) {
      this.partySlot.splice(index, 1);
      return true;
    }

    return false;
  }
}
