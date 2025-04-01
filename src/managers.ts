import { KEY } from './enums/key';
import { MODE } from './enums/mode';
import { Message } from './interface/sys';
import { Mode } from './mode';
import { LoginMode, NewGameMode, NoneMode, OverworldMode, RegisterMode, TitleMode } from './modes';
import { InGameScene } from './scenes/ingame-scene';
import { MessageUi } from './ui/message-ui';
import { QuestionUi } from './ui/question-ui';
import { Ui } from './ui/ui';

interface Modes {
  key: MODE;
  value: Mode;
}

export class MessageManager {
  private static instance: MessageManager;
  private scene!: InGameScene;
  private messageUi!: MessageUi;
  private questionUi!: QuestionUi;
  private isMessageAcive: boolean = false;

  init(scene: InGameScene): void {
    this.scene = scene;
    this.messageUi = new MessageUi(scene);
    this.messageUi.setup();
    this.questionUi = new QuestionUi(scene);
    this.questionUi.setup();
  }

  static getInstance(): MessageManager {
    if (!MessageManager.instance) {
      MessageManager.instance = new MessageManager();
    }
    return MessageManager.instance;
  }

  async show(currentUi: Ui, messages: Message[]): Promise<boolean> {
    let ret = false;
    if (this.isMessageAcive) return ret;
    this.isMessageAcive = true;

    try {
      for (const msg of messages) {
        const result = await this.messageUi.show(msg);
        if (msg.format === 'question' && result) {
          ret = result;
        }
      }
    } finally {
      this.isMessageAcive = false;
      this.messageUi.pause(true);
      currentUi.pause(false);
    }

    return ret;
  }
}

type KeyCallback = (key: KEY) => void;

export class KeyboardManager {
  private static instance: KeyboardManager;
  private scene!: InGameScene;
  private allowKey: Map<KEY, Phaser.Input.Keyboard.Key> = new Map();
  private keyDownCallback!: KeyCallback;
  private keyUpCallback!: KeyCallback;
  private isKeyBlocked: boolean = false;

  static getInstance(): KeyboardManager {
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = new KeyboardManager();
    }
    return KeyboardManager.instance;
  }

  init(scene: InGameScene): void {
    this.scene = scene;
    this.scene.events.on('update', this.updateKeys, this);
  }

  setAllowKey(keys: KEY[]): void {
    if (this.isKeyBlocked) return;

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

  blockKeys(onoff: boolean): void {
    this.isKeyBlocked = onoff;
  }

  clearCallbacks(): void {
    this.keyDownCallback = undefined!;
    this.keyUpCallback = undefined!;
  }

  private updateKeys(): void {
    if (this.isKeyBlocked) return;

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
  private static instance: ModeManager;
  private modes!: Modes[];
  private modeCache: Map<MODE, Mode> = new Map();
  private currentMode!: Mode;

  static getInstance(): ModeManager {
    if (!ModeManager.instance) {
      ModeManager.instance = new ModeManager();
    }
    return ModeManager.instance;
  }

  init(scene: InGameScene) {
    this.modes = [
      { key: MODE.NONE, value: new NoneMode(scene) },
      { key: MODE.LOGIN, value: new LoginMode(scene) },
      { key: MODE.REGISTER, value: new RegisterMode(scene) },
      { key: MODE.TITLE, value: new TitleMode(scene) },
      { key: MODE.NEWGAME, value: new NewGameMode(scene) },
      { key: MODE.OVERWORLD, value: new OverworldMode(scene) },
    ];

    this.registerModes();
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
