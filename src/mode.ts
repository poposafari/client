import { ModeManager } from './managers';
import { InGameScene } from './scenes/ingame-scene';
import { Ui } from './ui/ui';

export abstract class Mode {
  protected scene: InGameScene;
  protected manager: ModeManager;
  protected ui!: Ui;
  protected uis: Ui[] = [];
  protected uiStack: Ui[] = [];

  constructor(scene: InGameScene, manager: ModeManager) {
    this.scene = scene;
    this.manager = manager;
  }

  findUiByType(type: string): Ui | undefined {
    return this.uis.find((ui) => ui.constructor.name === type);
  }

  getUiStackTop(): Ui {
    return this.uiStack[this.uiStack.length - 1];
  }

  getUiStackBottom(): Ui {
    return this.uiStack[0];
  }

  getUiType(type: string) {
    const target = this.findUiByType(type)!;
    return target;
  }

  addUiStack(type: string, data?: any) {
    const target = this.findUiByType(type)!;

    if (this.uiStack.length > 0) {
      this.getUiStackTop().pause(true);
    }

    this.uiStack.push(target);
    this.getUiStackTop().show(data);
  }

  addUiStackOverlap(type: string, data?: any) {
    const target = this.findUiByType(type)!;
    this.uiStack.push(target);
    this.getUiStackTop().show(data);
  }

  cleanUiStack() {
    this.uiStack = [];
  }

  popUiStack(data?: any) {
    this.uiStack.pop();
    this.getUiStackTop().pause(false);
  }

  abstract init(): void;
  abstract enter(): void;
  abstract exit(): void;
  abstract update(time: number, delta: number): void;
}
