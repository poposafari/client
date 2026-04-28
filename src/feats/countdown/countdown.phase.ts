import { IGamePhase, IInputHandler } from '@poposafari/core';
import type { GameScene } from '@poposafari/scenes';
import { TitlePhase } from '../title';
import { CountdownUi } from './countdown.ui';

const COUNTDOWN_GRACE_MS = 10 * 1000;

export class CountdownPhase implements IGamePhase, IInputHandler {
  private ui!: CountdownUi;
  private startedAt = 0;
  private lastShownSeconds = -1;
  private finished = false;

  constructor(private readonly scene: GameScene) {}

  enter(): void {
    this.startedAt = Date.now();
    this.ui = new CountdownUi(this.scene);
    this.ui.show();
    this.refresh();

    const im = this.scene.getInputManager();
    im.clearInputQueue();
    im.push(this);
  }

  exit(): void {
    const im = this.scene.getInputManager();
    im.pop(this);
    this.ui?.hide();
  }

  update(): void {
    if (this.finished) return;
    this.refresh();
  }

  onInput(_key: string): void {
    if (this.finished) return;

    this.scene.markActivity();
    this.finished = true;
    this.scene.popPhase();
  }

  private refresh(): void {
    const elapsed = Date.now() - this.startedAt;
    const remainingMs = COUNTDOWN_GRACE_MS - elapsed;
    if (remainingMs <= 0) {
      this.expire();
      return;
    }
    const seconds = Math.ceil(remainingMs / 1000);
    if (seconds !== this.lastShownSeconds) {
      this.lastShownSeconds = seconds;
      this.ui.setRemainingSeconds(seconds);
    }
  }

  private expire(): void {
    this.finished = true;
    const socket = this.scene.getSocket();
    if (socket) {
      socket.disconnect();
      this.scene.setSocket(null);
    }

    this.scene.clearUser();
    this.scene.switchPhase(new TitlePhase(this.scene, { forceContinueEnabled: true }));
  }
}
