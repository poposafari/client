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

  addUiStack(type: string) {
    const target = this.findUiByType(type)!;
    this.uiStack.push(target);
  }

  popUiStack() {
    this.uiStack.pop();
  }

  abstract init(): void;
  abstract enter(): void;
  abstract exit(): void;
  abstract update(time: number, delta: number): void;
}
