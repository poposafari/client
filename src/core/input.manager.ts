import { debugLog } from '@poposafari/utils/debug';

export interface IInputHandler {
  onInput(key: string): void | Promise<void>;
}

export class InputManager {
  private stack: IInputHandler[] = [];
  private inputQueue: string[] = [];

  private readonly maxProcessPerFrame = 2;

  constructor(scene: Phaser.Scene) {
    scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      this.inputQueue.push(event.code);
    });
  }

  update(): void {
    const count = Math.min(this.maxProcessPerFrame, this.inputQueue.length);

    for (let i = 0; i < count; i++) {
      const keyCode = this.inputQueue.shift();
      if (keyCode) {
        this.dispatch(keyCode);
      }
    }
  }

  push(handler: IInputHandler): void {
    this.stack.push(handler);
    this.logInputStack('push');
  }

  pop(handler: IInputHandler): void {
    if (this.stack[this.stack.length - 1] === handler) {
      this.stack.pop();
    }
    this.logInputStack('pop');
  }

  isTop(handler: IInputHandler): boolean {
    return this.stack.length > 0 && this.stack[this.stack.length - 1] === handler;
  }

  /** 입력 큐 비우기. 문 전환 등 입력 무시 구간 진입 시 호출. */
  clearInputQueue(): void {
    this.inputQueue.length = 0;
  }

  debug(name: string) {
    debugLog(`Debug Title(${name}) :`, this.stack);
  }

  private logInputStack(tag: string): void {
    const names = this.stack.map((h) => (h as any).constructor?.name ?? '?');
    debugLog(`[InputStack] ${tag} | length=${this.stack.length} | [${names.join(', ')}]`);
  }

  private dispatch(key: string): void {
    if (this.stack.length > 0) {
      // this.debug('dispatch');
      this.stack[this.stack.length - 1].onInput(key);
    }
  }
}
