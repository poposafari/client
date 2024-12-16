import { DIRECTION } from './enums/direction';
import { KEY } from './enums/key';
import { MODE } from './enums/mode';
import { PLAYER_STATUS } from './enums/player-status';
import { TEXTURE_PLAYER_MAP } from './enums/texture';
import { BagItem, Message } from './interface/sys';
import { Mode } from './mode';
import { BagMode, LoginMode, NewGameMode, NoneMode, OverworldMode, RegisterMode, TitleMode } from './modes';
import { InGameScene } from './scenes/ingame-scene';
import { MessageUi } from './ui/message-ui';
import { Ui } from './ui/ui';

interface Modes {
  key: MODE;
  value: Mode;
}

export class GlobalManager {
  private static managers: Map<string, any> = new Map();

  static register<T>(name: string, manager: T): void {
    this.managers.set(name, manager);
  }

  static get<T>(name: string): T {
    return this.managers.get(name);
  }
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

export class PlayerManager {
  private static instance: PlayerManager;
  private gender!: string;
  private avatarType!: number;
  private nickname!: string;
  private currentLocation!: MODE;
  private posX: number = 4;
  private posY: number = 3;
  private lastDirectrion: DIRECTION = DIRECTION.DOWN;
  private items: Record<string, BagItem> = {};
  private itemSlots: Array<BagItem> = [];

  static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }
    return PlayerManager.instance;
  }

  initialize(gender: boolean, avatarType: number, nickname: string): void {
    this.gender = gender ? 'BOY' : 'GIRL';
    this.avatarType = avatarType;
    this.nickname = nickname;

    this.addItem('000', 1);
    this.addItem('001', 5);
    this.addItem('002', 3);
    this.addItem('003', 2);
    this.addItem('004', 10);
    this.addItem('005', 1);

    for (let i = 0; i < 9; i++) {
      this.itemSlots.push({ idx: '000', stock: 0 });
    }

    this.setItemSlot(2, '003');
    this.setItemSlot(0, '005');
  }

  addItem(key: string, quantity: number): void {
    if (this.items[key]) {
      this.items[key].stock += quantity;
    } else {
      this.items[key] = { idx: key, stock: quantity };
    }
  }

  setItemSlot(idx: number, item: string) {
    const ret = this.getBagItem(item);

    if (ret) {
      this.itemSlots[idx] = ret;
    }

    if (ret.idx === '000') {
      this.itemSlots;
    }
  }

  getItemSlot() {
    return this.itemSlots;
  }

  getItemCount(): number {
    return Object.keys(this.items).length;
  }

  getBagItem(key: string) {
    return this.items[key] || null;
  }

  getGender() {
    return this.gender;
  }

  getAvatarType() {
    return this.avatarType;
  }

  getNickname() {
    return this.nickname;
  }

  getType(type: PLAYER_STATUS) {
    const key = `${this.gender}_${this.avatarType}_${type}`;

    return TEXTURE_PLAYER_MAP[key];
  }

  getPosX() {
    return this.posX;
  }

  getPosY() {
    return this.posY;
  }

  getCurrentLocation() {
    return this.currentLocation;
  }

  getLastDirection() {
    return this.lastDirectrion;
  }

  setPosX(value: number) {
    this.posX = value;
  }

  setPosY(value: number) {
    this.posY = value;
  }

  setCurrentLocation(mode: MODE) {
    this.currentLocation = mode;
  }

  setLastDirection(direction: DIRECTION) {
    this.lastDirectrion = direction;
  }
}
