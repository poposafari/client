import { EVENT } from '../enums/event';
import { MODE } from '../enums/mode';

export interface Register {}

export interface Account {
  username: string;
  password: string;
}

export interface Message {
  type: 'sys' | 'default' | 'battle';
  format: 'talk' | 'question';
  content: string;
  speed: number;
  end: MODE | EVENT;
}

export interface BagItem {
  idx: string;
  stock: number;
  itemSlot: number;
}

export interface MyPokemon {
  idx: string;
  capturedDate: string;
  isShiny: boolean;
  gender: string;
  partySlot: number;
}
