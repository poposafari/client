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
