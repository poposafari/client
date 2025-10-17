import { EVENT } from '../enums';

type EventCallback = (...args: any[]) => void;

export class EventBus {
  private listeners = new Map<EVENT | string, EventCallback[]>();

  on(event: EVENT | string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: EVENT | string, ...args: any[]) {
    const cbs = this.listeners.get(event);
    if (cbs) {
      cbs.forEach((cb) => cb(...args));
    }
  }

  off(event: EVENT | string, callback: EventCallback) {
    const cbs = this.listeners.get(event);
    if (!cbs) return;
    this.listeners.set(
      event,
      cbs.filter((cb) => cb !== callback),
    );
  }
}

export const eventBus = new EventBus();
