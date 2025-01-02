import { getItemType, getItemUsageType } from './data/items';
import { Pokemon } from './data/pokemon';
import { DIRECTION } from './enums/direction';
import { ITEM, ITEM_USAGE_TYPE } from './enums/item';
import { KEY } from './enums/key';
import { MODE } from './enums/mode';
import { PLAYER_STATUS } from './enums/player-status';
import { TEXTURE_PLAYER_MAP } from './enums/texture';
import { BagItem, Message, MyPokemon } from './interface/sys';
import { Mode } from './mode';
import { BagMode, BoxMode, LoginMode, NewGameMode, NoneMode, OverworldMode, RegisterMode, TitleMode } from './modes';
import { InGameScene } from './scenes/ingame-scene';
import { MessageUi } from './ui/message-ui';
import { Ui } from './ui/ui';

interface Modes {
  key: MODE;
  value: Mode;
}

export class MessageManager {
  private static instance: MessageManager;
  private scene!: InGameScene;
  private messageUi!: MessageUi;

  initialize(scene: InGameScene): void {
    this.scene = scene;
    this.messageUi = new MessageUi(scene);
    this.messageUi.setup();
  }

  static getInstance(): MessageManager {
    if (!MessageManager.instance) {
      MessageManager.instance = new MessageManager();
    }
    return MessageManager.instance;
  }

  async show(currentUi: Ui, messages: Message[]): Promise<void> {
    for (const msg of messages) {
      await this.messageUi.show(msg);
    }

    this.messageUi.pause(true);
    currentUi.pause(false);
  }
}

type KeyCallback = (key: KEY) => void;

export class KeyboardManager {
  private static instance: KeyboardManager;
  private scene!: InGameScene;
  private allowKey: Map<KEY, Phaser.Input.Keyboard.Key> = new Map();
  private keyDownCallback!: KeyCallback;
  private keyUpCallback!: KeyCallback;

  static getInstance(): KeyboardManager {
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = new KeyboardManager();
    }
    return KeyboardManager.instance;
  }

  initialize(scene: InGameScene): void {
    this.scene = scene;
    this.scene.events.on('update', this.updateKeys, this);
  }

  setAllowKey(keys: KEY[]): void {
    this.allowKey.clear();

    keys.forEach((keyCode) => {
      const key = this.scene.input.keyboard?.addKey(keyCode);
      if (key) this.allowKey.set(keyCode, key);
    });
  }

  setKeyDownCallback(callback: KeyCallback): void {
    this.keyDownCallback = callback;
  }

  setKeyUpCallback(callback: KeyCallback): void {
    this.keyUpCallback = callback;
  }

  clearCallbacks(): void {
    this.keyDownCallback = undefined!;
    this.keyUpCallback = undefined!;
  }

  private updateKeys(): void {
    this.allowKey.forEach((key, keyCode) => {
      if (Phaser.Input.Keyboard.JustDown(key) && this.keyDownCallback) {
        this.keyDownCallback(keyCode);
      } else if (Phaser.Input.Keyboard.JustUp(key) && this.keyUpCallback) {
        this.keyUpCallback(keyCode);
      }
    });
  }
}

export class ModeManager {
  private scene: InGameScene;
  private modes: Modes[];
  private modeCache: Map<MODE, Mode> = new Map();
  private currentMode!: Mode;

  constructor(scene: InGameScene) {
    this.scene = scene;

    this.modes = [
      { key: MODE.NONE, value: new NoneMode(scene, this) },
      { key: MODE.LOGIN, value: new LoginMode(scene, this) },
      { key: MODE.REGISTER, value: new RegisterMode(scene, this) },
      { key: MODE.TITLE, value: new TitleMode(scene, this) },
      { key: MODE.NEWGAME, value: new NewGameMode(scene, this) },
      { key: MODE.OVERWORLD, value: new OverworldMode(scene, this) },
      { key: MODE.BAG, value: new BagMode(scene, this) },
      { key: MODE.BOX, value: new BoxMode(scene, this) },
    ];
  }

  registerModes() {
    for (const mode of this.modes) {
      mode.value.init();
      this.modeCache.set(mode.key, mode.value);
    }
  }

  changeMode(mode: MODE) {
    if (this.currentMode) {
      this.currentMode.exit();
    }

    const targetMode = this.modeCache.get(mode);
    if (targetMode) {
      this.currentMode = targetMode;
      this.currentMode.enter();
    } else {
      console.error(`Mode ${mode} not found`);
    }
  }

  isOverworldMode(): boolean {
    return this.currentMode instanceof OverworldMode;
  }

  getCurrentMode() {
    return this.currentMode;
  }
}

export const MAX_PARTY_SLOT = 6;

export class PlayerPokemonManager {
  private static instance: PlayerPokemonManager;
  private myPokemons: Array<MyPokemon> = [];
  private myPokemonSlots: Array<number> = [];

  static getInstance(): PlayerPokemonManager {
    if (!PlayerPokemonManager.instance) {
      PlayerPokemonManager.instance = new PlayerPokemonManager();
    }
    return PlayerPokemonManager.instance;
  }

  init() {
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      this.myPokemonSlots.push(-1);
    }

    this.addMyPokemon('001', '2024-12-25 09:10', true, 'b', -1);
    this.addMyPokemon('002', '2024-12-17 09:46', true, 'g', -1);
    this.addMyPokemon('003', '2024-12-20 09:10', true, 'b', -1);
    this.addMyPokemon('004', '2024-10-17 09:10', false, 'b', -1);
    this.addMyPokemon('005', '2024-12-17 09:10', false, 'g', -1);
    this.addMyPokemon('006', '2024-11-17 13:15', false, 'b', -1);
    this.addMyPokemon('007', '2024-12-17 09:10', false, 'b', -1);
    this.addMyPokemon('008', '2024-09-17 09:10', false, 'g', -1);
    this.addMyPokemon('009', '2024-12-17 09:10', false, 'b', -1);
    this.addMyPokemon('002', '2024-12-17 09:10', false, 'g', -1);

    this.addMyPokemon('002', '2024-04-17 09:10', false, 'g', -1);
    this.addMyPokemon('006', '2024-12-17 08:32', true, 'g', -1);
    this.addMyPokemon('001', '2024-06-17 09:10', false, 'g', -1);
    this.addMyPokemon('007', '2024-12-17 09:10', true, 'b', -1);
    this.addMyPokemon('005', '2024-02-17 10:30', true, 'b', -1);
    this.addMyPokemon('008', '2024-12-17 09:10', false, 'b', -1);
    this.addMyPokemon('003', '2024-12-17 09:10', false, 'b', -1);
    this.addMyPokemon('004', '2024-12-17 09:10', false, 'b', -1);
  }

  getMyPokemons() {
    if (this.myPokemons) return this.myPokemons;

    return [];
  }

  getMyPokemon(idx: number): MyPokemon {
    if (this.myPokemons[idx]) return this.myPokemons[idx];

    throw new Error('가지고 있지 않은 포켓몬인데요^^');
  }

  getMyPokemonKey(idx: number): string | '000' {
    if (idx < 0) return '000';
    const myPokemon = this.getMyPokemon(idx);
    let pokedex = myPokemon.idx;

    if (!myPokemon || !pokedex) return '000';
    if (myPokemon.isShiny) pokedex += 's';

    return pokedex;
  }

  getMyPokemonSlots() {
    if (this.myPokemonSlots) return this.myPokemonSlots;

    return [];
  }

  setMyPokemonSlot(idx: number, pokeIdx: number) {
    if (idx < 0) throw new Error('잘못된 인덱스임.^^');
    if (this.myPokemons[pokeIdx]) {
      this.myPokemons[pokeIdx].partySlot = idx;
      this.myPokemonSlots[idx] = pokeIdx;
    }
  }

  resetMyPokemonSlot(idx: number, pokeIdx: number) {
    if (idx < 0) throw new Error('잘못된 인덱스임.^^');
    if (this.myPokemons[pokeIdx]) {
      this.myPokemons[pokeIdx].partySlot = -1;
      this.myPokemonSlots[idx] = -1;
    }
  }

  addMyPokemon(key: string, capturedDate: string, isShiny: boolean, gender: string, partySlot: number) {
    this.myPokemons.push({
      idx: key,
      capturedDate: capturedDate,
      isShiny: isShiny,
      gender: gender,
      partySlot: partySlot,
    });
  }
}

export const MAX_ITEM_SLOT = 9;

export class PlayerItemManager {
  private static instance: PlayerItemManager;
  private myItems: Record<string, BagItem> = {};
  private myItemSlots: Array<string> = [];

  static getInstance(): PlayerItemManager {
    if (!PlayerItemManager.instance) {
      PlayerItemManager.instance = new PlayerItemManager();
    }
    return PlayerItemManager.instance;
  }

  init() {
    for (let i = 0; i < MAX_ITEM_SLOT; i++) {
      this.myItemSlots.push('000');
    }

    this.addItem('001', 2);
    this.addItem('004', 2);
    this.addItem('002', 2);
    this.addItem('003', 2);
    this.addItem('005', 1);
    this.addItem('006', 1);
  }

  getMyItems() {
    return this.myItems;
  }

  getMyItemsSize() {
    return Object.keys(this.myItems).length;
  }

  getMyItemSlots() {
    return this.myItemSlots;
  }

  getMyItem(itemIdx: string): BagItem {
    if (this.myItems[itemIdx]) return this.myItems[itemIdx];

    return { idx: '000', stock: 0, itemSlot: -1 };
  }

  addItem(key: string, quantity: number): void {
    if (this.myItems[key]) {
      this.myItems[key].stock += quantity;
    } else {
      this.myItems[key] = { idx: key, stock: quantity, itemSlot: -1 };
    }
  }

  restMyItemSlot(idx: number, itemIdx: string) {
    const item = this.getMyItem(itemIdx);
    this.myItemSlots[idx] = '000';
    item.itemSlot = -1;
  }

  setMyItemSlot(idx: number, itemIdx: string) {
    const ret = this.getMyItem(itemIdx);
    if (idx < 0) throw new Error('잘못된 인덱스임.^^');
    if (ret.idx !== '000') {
      this.myItemSlots[idx] = ret.idx;
      ret.itemSlot = idx;
      return;
    }

    throw new Error('예기치 못한 에러임.');
  }

  validateItemForUse(itemIdx: string) {
    if (!this.hasMyItemStock(itemIdx)) return false;
    //TODO: 현재 플레이어의 MAP 위치에 따라서 true, false를 나눌 수 있음.

    return true;
  }

  reduceItemStock(itemIdx: string) {
    const itemType = getItemUsageType(itemIdx);

    if (itemType === ITEM_USAGE_TYPE.NON_CONSUMABLE) return false;

    this.getMyItem(itemIdx).stock -= 1;

    if (this.getMyItem(itemIdx).stock === 0) {
      const slotIndex = this.myItemSlots.findIndex((slot) => slot === itemIdx);

      if (slotIndex !== -1) {
        this.restMyItemSlot(slotIndex, itemIdx);
        delete this.myItems[itemIdx];
      }
    }
    return true;
  }

  private hasMyItemStock(itemIdx: string) {
    const myItem = this.getMyItem(itemIdx);

    if (myItem.idx === '000') return false;

    if (myItem && myItem.idx !== '000') {
      return myItem.stock <= 0 ? false : true;
    }

    throw new Error('예기치 못한 오류');
  }
}

export class PlayerInfoManager {
  private static instance: PlayerInfoManager;
  private gender!: 'boy' | 'girl';
  private avatarType!: 1 | 2 | 3 | 4;
  private nickname!: string;
  private posX!: number;
  private posY!: number;
  private lastDirectrion!: DIRECTION;
  private lastFollowPokemonDirectrion!: DIRECTION;
  private lastStatus!: PLAYER_STATUS;
  private followPokemon!: number;
  private fpPosX!: number;
  private fpPosY!: number;

  static getInstance(): PlayerInfoManager {
    if (!PlayerInfoManager.instance) {
      PlayerInfoManager.instance = new PlayerInfoManager();
    }
    return PlayerInfoManager.instance;
  }

  init() {
    this.gender = 'girl';
    this.nickname = '운영자';
    this.avatarType = 4;
    this.posX = 4;
    this.posY = 4;
    this.lastDirectrion = DIRECTION.DOWN;
    this.lastFollowPokemonDirectrion = DIRECTION.DOWN;
    this.lastStatus = PLAYER_STATUS.WALK;
    this.followPokemon = -1;
    this.fpPosX = 4;
    this.fpPosY = 3;
  }

  getInfo() {
    return {
      gender: this.gender,
      avatarType: this.avatarType,
      nickname: this.nickname,
      pos: {
        x: this.posX,
        y: this.posY,
      },
      fpPos: {
        x: this.fpPosX,
        y: this.fpPosY,
      },
      lastDirection: this.lastDirectrion,
      lastFollowPokemonDirectrion: this.lastFollowPokemonDirectrion,
      lastStatus: this.lastStatus,
    };
  }

  getMyFollowPokemon() {
    if (this.followPokemon > 0 && this.followPokemon) return this.followPokemon;

    return -1;
  }

  setMyFollowPokemon(pokeIdx: number) {
    if (pokeIdx < 0) throw new Error('잘못된 인덱스임.^^');

    if (pokeIdx > 0) return (this.followPokemon = pokeIdx);

    this.followPokemon = -1;
  }

  getType(type: PLAYER_STATUS) {
    const key = `${this.gender}_${this.avatarType}_${type}`;

    return TEXTURE_PLAYER_MAP[key];
  }

  setPosX(x: number) {
    this.posX = x;
  }

  setPosY(y: number) {
    this.posY = y;
  }

  setFollowPokemonPosX(x: number) {
    this.fpPosX = x;
  }

  setFollowPokemonPosY(y: number) {
    this.fpPosY = y;
  }

  setLastDirection(direction: DIRECTION) {
    this.lastDirectrion = direction;
  }

  setFollowPokemonLastDirection(direction: DIRECTION) {
    this.lastFollowPokemonDirectrion = direction;
  }
}
