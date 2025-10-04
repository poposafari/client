import { KEY } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';

type KeyCallback = (key: KEY) => void;

export class KeyboardHandler {
  private static instance: KeyboardHandler;
  private scene!: InGameScene;
  private allowKey: Map<KEY, Phaser.Input.Keyboard.Key> = new Map();
  private keyDownCallback!: KeyCallback;
  private keyUpCallback!: KeyCallback;
  private isKeyBlocked: boolean = false;

  static getInstance(): KeyboardHandler {
    if (!KeyboardHandler.instance) {
      KeyboardHandler.instance = new KeyboardHandler();
    }
    return KeyboardHandler.instance;
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
