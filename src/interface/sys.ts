export interface Register {}

export interface Account {
  username: string;
  password: string;
}

export interface Message {
  type: 'sys' | 'default';
  format: 'talk' | 'question';
  content: string;
}

export interface BagItem {
  idx: string;
  stock: number;
}

export interface MyPokemon {
  idx: string;
  capturedDate: string;
  isShiny: boolean;
  gender: string;
  partySlot: number;
}
