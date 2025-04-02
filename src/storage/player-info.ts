import { HttpStatusCode } from 'axios';
import { ingameApi, nicknameApi } from '../utils/axios';
import { MyPokemon } from './box';

export interface Location {
  overworld: string;
  x: number;
  y: number;
}

export class PlayerInfo {
  private static instance: PlayerInfo;

  private nickname!: string;
  private gender!: 'boy' | 'girl';
  private avatar!: 1 | 2 | 3 | 4;
  private location!: Location;
  private pet!: MyPokemon | null;
  private money!: number;
  private partySlot: MyPokemon[] = [];

  private readonly MaxSlot: number = 6;

  constructor() {}

  static getInstance(): PlayerInfo {
    if (!PlayerInfo.instance) {
      PlayerInfo.instance = new PlayerInfo();
    }
    return PlayerInfo.instance;
  }

  setup(data: any) {
    const playerData = data;
    this.nickname = playerData.nickname;
    this.gender = playerData.gender;
    this.avatar = playerData.avatar;
    this.location = {
      overworld: playerData.location,
      x: playerData.x,
      y: playerData.y,
    };
    this.pet = playerData.pet;
    this.money = playerData.money;
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

  getPet() {
    return this.pet;
  }

  getMoney() {
    return this.money;
  }

  setNickname(nickname: string) {
    this.nickname = nickname;
  }

  setGender(gender: 'boy' | 'girl') {
    this.gender = gender;
  }

  setAvatar(avatar: 1 | 2 | 3 | 4) {
    this.avatar = avatar;
  }

  setLocation(location: Location) {
    if (!this.location) {
      this.location = { overworld: '', x: 0, y: 0 };
    }

    this.location.overworld = location.overworld;
    this.location.x = location.x;
    this.location.y = location.y;
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
