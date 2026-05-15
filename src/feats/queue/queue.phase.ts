import { IGamePhase, IInputHandler } from '@poposafari/core';
import type { GameScene } from '@poposafari/scenes';
import { KEY } from '@poposafari/types';
import { TitlePhase } from '../title';
import { OverworldEntryPhase } from '../overworld/overworld-entry.phase';
import { QueueUi } from './queue.ui';

const POLL_MS = 3000;

export class QueuePhase implements IGamePhase, IInputHandler {
  private ui!: QueueUi;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private polling = false;
  private finished = false;

  constructor(
    private readonly scene: GameScene,
    private readonly initialPosition: number,
  ) {}

  enter(): void {
    this.ui = new QueueUi(this.scene);
    this.ui.show();
    this.ui.setPosition(this.initialPosition);

    const im = this.scene.getInputManager();
    im.clearInputQueue();
    im.push(this);

    this.pollTimer = setInterval(() => {
      void this.poll();
    }, POLL_MS);
  }

  exit(): void {
    this.clearPollTimer();
    const im = this.scene.getInputManager();
    im.pop(this);
    this.ui?.hide();
  }

  onInput(key: string): void {
    if (this.finished) return;
    if (key === KEY.ESC) {
      void this.handleCancel();
    }
  }

  onRefreshLanguage(): void {
    this.ui?.onRefreshLanguage();
  }

  private async poll(): Promise<void> {
    if (this.finished || this.polling) return;
    this.polling = true;
    try {
      const res = await this.scene.getApi().queueStatus();
      if (this.finished) return;

      if (res.ready) {
        this.finished = true;
        this.clearPollTimer();
        this.scene.switchPhase(new OverworldEntryPhase(this.scene, undefined, res.token));
        return;
      }

      if (res.position === null) {
        this.finished = true;
        this.clearPollTimer();
        this.scene.switchPhase(new TitlePhase(this.scene, { forceContinueEnabled: true }));
        return;
      }

      this.ui.setPosition(res.position);
    } catch {
      // fail-silent: 다음 폴링에서 재시도
    } finally {
      this.polling = false;
    }
  }

  private async handleCancel(): Promise<void> {
    if (this.finished) return;
    this.finished = true;
    this.clearPollTimer();
    try {
      await this.scene.getApi().queueCancel();
    } catch {
      // 멱등: 실패해도 무시
    }
    this.scene.switchPhase(new TitlePhase(this.scene, { forceContinueEnabled: true }));
  }

  private clearPollTimer(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
