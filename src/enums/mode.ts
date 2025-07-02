export enum MODE {
  NONE,
  CONNECT,
  MESSAGE,
  LOGIN,
  REGISTER,
  TITLE,
  WELCOME,
  NEWGAME,
  OVERWORLD,
  BAG,
  BOX,
  ACCOUNT_DELETE,
  CONNECT_ACCOUNT_DELETE,
  OVERWORLD_CONNECTING,
  OVERWORLD_MENU,
  SHOP,
  POKEBOX,
  SAFARI_LIST,
  HIDDEN_MOVE,
  BATTLE,
  EVOLVE,
}

export function isMode(data: any): data is MODE {
  return Object.values(MODE).includes(data);
}
