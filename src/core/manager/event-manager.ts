import { EVENT } from '../../enums';

type EventCallback = (...args: any[]) => void;
type EventKey = EVENT | string;

interface TrackedEvent {
  event: EventKey;
  callback: EventCallback;
}

export class EventManager {
  private static instance: EventManager;
  private listeners = new Map<EventKey, EventCallback[]>();
  private uiEventMap = new Map<string, TrackedEvent[]>();

  private constructor() {}

  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  init(): void {}

  on(event: EventKey, callback: EventCallback) {
    const eventKey = String(event);
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, []);
    }
    this.listeners.get(eventKey)!.push(callback);
  }

  onForUI(uiId: string, event: EventKey, callback: EventCallback): void {
    this.on(event, callback);

    if (!this.uiEventMap.has(uiId)) {
      this.uiEventMap.set(uiId, []);
    }
    this.uiEventMap.get(uiId)!.push({ event: String(event), callback });
  }

  emit(event: EventKey, ...args: any[]) {
    const eventKey = String(event);
    const cbs = this.listeners.get(eventKey);
    if (cbs) {
      cbs.forEach((cb) => cb(...args));
    }
  }

  off(event: EventKey, callback: EventCallback) {
    const eventKey = String(event);
    const cbs = this.listeners.get(eventKey);
    if (!cbs) return;
    this.listeners.set(
      eventKey,
      cbs.filter((cb) => cb !== callback),
    );
  }

  cleanupForUI(uiId: string): void {
    const events = this.uiEventMap.get(uiId);
    if (events) {
      events.forEach(({ event, callback }) => {
        this.off(event, callback);
      });
      this.uiEventMap.delete(uiId);
    }
  }

  clear(): void {
    this.listeners.clear();
    this.uiEventMap.clear();
  }
}

export const Event = EventManager.getInstance();
