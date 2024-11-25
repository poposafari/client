import { KEY } from './enums/key';
import { MODE } from './enums/mode';
import { Message } from './interface/sys';
import { Mode } from './mode';
import { LabOverworldMode, LoginMode, NewGameMode, NoneMode, OverworldMode, RegisterMode, TitleMode } from './modes';
import { PlayerObject } from './object/player-object';
import { InGameScene } from './scenes/ingame-scene';
import { MessageUi } from './ui/message-ui';
import { UI } from './ui/ui';

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

  async show(currentUi: UI, messages: Message[]): Promise<void> {
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
      { key: MODE.LAB_OVERWORLD, value: new LabOverworldMode(scene, this) },
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
    return this.currentMode instanceof OverworldMode || this.currentMode instanceof LabOverworldMode;
  }

  getCurrentMode() {
    return this.currentMode;
  }
}

export class PlayerManager {
  private static instance: PlayerManager;
  private scene!: InGameScene;
  private player!: PlayerObject;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }
}
