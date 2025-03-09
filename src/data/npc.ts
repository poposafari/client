export interface Npc {
  movable: boolean;
}

const initial: Record<string, Npc> = {
  //Taxi driver plaza.
  npc000: {
    movable: false,
  },
  //Taxi driver safari.
  npc001: {
    movable: false,
  },
  //Shopkeeper.
  npc002: {
    movable: false,
  },
};

export const npcData = new Proxy(initial, {
  get(target, key: string) {
    if (key in target) {
      return target[key];
    } else {
      console.warn(`Npc '${key}' does not exist.`);
      return null;
    }
  },
});
