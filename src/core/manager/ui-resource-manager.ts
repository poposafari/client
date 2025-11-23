import { InGameScene } from '../../scenes/ingame-scene';
import { Event } from './event-manager';

export class UIResourceManager {
  private scene: InGameScene;
  private containers: Phaser.GameObjects.Container[] = [];
  private gameObjects: Phaser.GameObjects.GameObject[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];
  private timers: Phaser.Time.TimerEvent[] = [];
  private eventListeners: Array<{ event: string | number; callback: (...args: any[]) => void }> = [];
  private keyboardCallbacks: Array<() => void> = [];

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  trackContainer(container: Phaser.GameObjects.Container): void {
    this.containers.push(container);
  }

  trackGameObject(obj: Phaser.GameObjects.GameObject): void {
    this.gameObjects.push(obj);
  }

  trackTween(tween: Phaser.Tweens.Tween): void {
    this.tweens.push(tween);
  }

  trackTimer(timer: Phaser.Time.TimerEvent): void {
    this.timers.push(timer);
  }

  trackEvent(event: string | number, callback: (...args: any[]) => void): void {
    const eventKey = String(event);
    Event.on(eventKey, callback);
    this.eventListeners.push({ event: eventKey, callback });
  }

  trackKeyboardCallback(callback: () => void): void {
    this.keyboardCallbacks.push(callback);
  }

  cleanup(): void {
    this.tweens.forEach((tween) => {
      if (tween && tween.targets) {
        this.scene.tweens.killTweensOf(tween.targets);
      }
    });
    this.tweens = [];

    this.timers.forEach((timer) => {
      if (timer && !timer.hasDispatched) {
        timer.remove();
      }
    });
    this.timers = [];

    this.keyboardCallbacks = [];

    this.eventListeners.forEach(({ event, callback }) => {
      Event.off(event, callback);
    });
    this.eventListeners = [];

    this.gameObjects.forEach((obj) => {
      if (obj && obj.active) {
        if (obj.removeAllListeners) {
          obj.removeAllListeners();
        }
        obj.destroy();
      }
    });
    this.gameObjects = [];

    this.containers.forEach((container) => {
      if (container && container.active) {
        container.removeAllListeners();
        container.removeAll(true);
        container.destroy();
      }
    });
    this.containers = [];
  }

  cleanupContainers(): void {
    this.containers.forEach((container) => {
      if (container && container.active) {
        container.removeAll(true);
        container.destroy();
      }
    });
    this.containers = [];
  }

  cleanupTweens(): void {
    this.tweens.forEach((tween) => {
      if (tween && tween.targets) {
        this.scene.tweens.killTweensOf(tween.targets);
      }
    });
    this.tweens = [];
  }
}
