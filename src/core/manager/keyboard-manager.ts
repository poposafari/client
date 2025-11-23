import { KEY } from '../../enums';
import { InGameScene } from '../../scenes/ingame-scene';

type KeyCallback = (key: KEY) => void;

export class KeyboardManager {
  private static instance: KeyboardManager;
  private scene!: InGameScene;
  private allowKey: Map<KEY, Phaser.Input.Keyboard.Key> = new Map();
  private keyDownCallback!: KeyCallback;
  private keyUpCallback!: KeyCallback;
  private isKeyBlocked: boolean = false;

  private lastKeyPressed: KEY | null = null;
  private lastKeyPressTime: number = 0;
  private keyCooldown: number = 100;
  private isProcessing: boolean = false;

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

  clearAllowKey(): void {
    this.allowKey.clear();
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
    this.resetKeyState();
  }

  setKeyCooldown(ms: number): void {
    this.keyCooldown = ms;
  }

  resetKeyState(): void {
    this.lastKeyPressed = null;
    this.lastKeyPressTime = 0;
    this.isProcessing = false;
  }

  startProcessing(): void {
    this.isProcessing = true;
  }

  endProcessing(): void {
    this.isProcessing = false;
  }

  private updateKeys(): void {
    if (this.isKeyBlocked) return;
    if (this.isProcessing) return;

    const currentTime = Date.now();

    this.allowKey.forEach((key, keyCode) => {
      if (Phaser.Input.Keyboard.JustDown(key) && this.keyDownCallback) {
        const isSameKey = this.lastKeyPressed === keyCode;
        const timeSinceLastPress = currentTime - this.lastKeyPressTime;

        if (isSameKey && timeSinceLastPress < this.keyCooldown) {
          return;
        }

        this.lastKeyPressed = keyCode;
        this.lastKeyPressTime = currentTime;
        this.keyDownCallback(keyCode);
      } else if (Phaser.Input.Keyboard.JustUp(key) && this.keyUpCallback) {
        this.keyUpCallback(keyCode);
      }
    });
  }
}

export const Keyboard = KeyboardManager.getInstance();
