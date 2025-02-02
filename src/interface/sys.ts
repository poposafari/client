export interface Register {}

export interface Account {
  username: string;
  password: string;
}

export interface Message {
  type: 'sys' | 'default' | 'battle';
  format: 'talk' | 'question';
  content: string;
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
