import { MODE } from './enums/mode';
import { Message } from './interface/sys';
import { Mode } from './mode';
import { LoginMode, NoneMode, RegisterMode } from './modes';
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
}
