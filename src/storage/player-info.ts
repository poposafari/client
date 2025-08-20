import { MyPokemon } from './box';
import { getPartyKey } from '../utils/string-util';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';
import { MaxItemSlot, MaxPartySlot, PlayerAvatar, PlayerGender, PokeBoxBG } from '../types';
import { SKILL } from '../enums/skill';

export interface Location {
  overworld: string;
  x: number;
  y: number;
}

export class PlayerInfo {
  private static instance: PlayerInfo;

  private id!: string;
  private nickname!: string;
  private gender!: PlayerGender;
  private avatar!: PlayerAvatar;
  private location!: string;
  private x!: number;
  private y!: number;
  private candy!: number;

  private pet!: MyPokemon | null;
  private isCallPet: boolean = false;
  private surfPokemon!: MyPokemon | null;
  private partySlot: (MyPokemon | null)[] = [];
  private itemSlot: (string | null)[] = [];
  private pokeboxBg: PokeBoxBG[] = [];
  private pokeboxBgCopy: PokeBoxBG[] = [];

  constructor() {
    eventBus.on(EVENT.PET_CALL, () => {
      this.isCallPet = true;
    });

    eventBus.on(EVENT.PET_RECALL, () => {
      this.isCallPet = false;
    });
  }

  static getInstance(): PlayerInfo {
    if (!PlayerInfo.instance) {
      PlayerInfo.instance = new PlayerInfo();
    }
    return PlayerInfo.instance;
  }

  get() {
    return {
      id: this.id,
      nickname: this.nickname,
      x: this.x,
      y: this.y,
      location: this.location,
      money: this.candy,
      gender: this.gender,
      avatar: this.avatar,
      boxes: this.pokeboxBg,
      party: this.partySlot,
      itemslot: this.itemSlot,
    };
  }

  setup(data: any) {
    if (!data) throw new Error('Player data is required');

    // console.log(data);

    this.id = data.account_id;
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

  getId() {
    return this.id;
  }

  setItemSlot(slot: number, item: string | null) {
    if (slot < 0 || slot >= MaxItemSlot) {
      throw new Error('Invalid item slot index');
    }

    const find = this.findItemSlot(item);

    if (find !== null) {
      this.itemSlot[find] = null;
    }

    this.itemSlot[slot] = item;
  }

  findItemSlot(item: string | null): number | null {
    for (let i = 0; i < MaxItemSlot; i++) {
      if (this.itemSlot[i] === item) {
        return i as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
      }
    }

    return null;
  }

  getIsCallPet() {
    return this.isCallPet;
  }

  setIsCallPet(onoff: boolean) {
    this.isCallPet = onoff;
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

  setPet(pet: MyPokemon | null) {
    this.pet = pet;
  }

  setCandy(candy: number) {
    this.candy = candy;
  }

  setSurfPokemon(pokemon: MyPokemon | null) {
    this.surfPokemon = pokemon;
  }

  getSurfPokemon() {
    return this.surfPokemon;
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

  getPartySlotIdx() {
    return this.partySlot.map((pokemon) => {
      return pokemon ? pokemon.idx : null;
    });
  }

  addPartySlot(pokemon: MyPokemon): boolean {
    if (this.partySlot.length >= MaxPartySlot) {
      return false;
    }

    this.partySlot.push(pokemon);

    return true;
  }

  hasPartySlot(pokemon: MyPokemon) {
    for (const party of this.partySlot) {
      if (party?.pokedex === pokemon.pokedex && party.gender === pokemon.gender) return true;
    }

    return false;
  }

  removePartSlot(pokemon: MyPokemon | null, idx?: number): boolean {
    let index = 0;

    if (idx !== undefined && idx >= 0) {
      index = idx;
    } else {
      for (let i = 0; i < MaxPartySlot; i++) {
        if (this.partySlot[i]?.pokedex === pokemon?.pokedex && this.partySlot[i]?.gender === pokemon?.gender) {
          index = i;
        }
      }
    }

    if (index !== -1) {
      this.partySlot.splice(index, 1);
      return true;
    }

    return false;
  }

  hasSurfInParty() {
    const slots = PlayerInfo.getInstance().getPartySlot();

    let idx = 0;
    for (const slot of slots) {
      if (!slot) return -1;

      for (const skill of slot.skill) {
        if (skill === 'surf') return idx;
      }

      idx++;
    }

    return -1;
  }
}
