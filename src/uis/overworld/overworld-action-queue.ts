import { OVERWORLD_ACTION } from '../../enums';

export type OverworldAction = () => Promise<void> | void;

export class OverworldActionQueue {
  private queue: Array<{ action: OverworldAction; overworldAction: OVERWORLD_ACTION }> = [];
  private isProcessing: boolean = false;
  private currentAction: OVERWORLD_ACTION = OVERWORLD_ACTION.IDLE;
  private onActionChange?: (action: OVERWORLD_ACTION) => void;

  constructor(onActionChange?: (action: OVERWORLD_ACTION) => void) {
    this.onActionChange = onActionChange;
  }

  async enqueue(action: OverworldAction, overworldAction: OVERWORLD_ACTION): Promise<void> {
    this.queue.push({ action, overworldAction });
    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { action, overworldAction } = this.queue.shift()!;

      this.setAction(overworldAction);

      try {
        await action();
      } catch (error) {
        console.error('Error executing player action:', error);
      } finally {
        this.setAction(OVERWORLD_ACTION.IDLE);
      }
    }

    this.isProcessing = false;
  }

  private setAction(action: OVERWORLD_ACTION): void {
    this.currentAction = action;
    this.onActionChange?.(action);
  }

  getCurrentAction(): OVERWORLD_ACTION {
    return this.currentAction;
  }

  isEmpty(): boolean {
    return this.queue.length === 0 && !this.isProcessing;
  }

  clear(): void {
    this.queue = [];
    this.isProcessing = false;
    this.setAction(OVERWORLD_ACTION.IDLE);
  }
}
