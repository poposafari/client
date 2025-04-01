import { MODE } from './enums/mode';
import { ModeManager } from './managers';
import { InGameScene } from './scenes/ingame-scene';
import { Bag } from './storage/bag';
import { Box } from './storage/box';
import { PlayerInfo } from './storage/player-info';
import { LoadingDefaultUi } from './ui/loading-default-ui';
import { Ui } from './ui/ui';

export abstract class Mode {
  protected scene: InGameScene;
  protected uis: Ui[] = [];
  protected uiStack: Ui[] = [];

  constructor(scene: InGameScene) {
    this.scene = scene;
    this.uis.push(new LoadingDefaultUi(scene, this));
  }

  changeMode(mode: MODE) {
    ModeManager.getInstance().changeMode(mode);
  }

  findUiByType(type: string): Ui | undefined {
    return this.uis.find((ui) => ui.constructor.name === type);
  }

  getUiStackTop(): Ui {
    return this.uiStack[this.uiStack.length - 1];
  }

  getUiStack(): Ui[] {
    return this.uiStack;
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
    this.getUiStackTop().pause(false, data);
  }

  abstract init(): void;
  abstract enter(): void;
  abstract exit(): void;
  abstract update(time: number, delta: number): void;
}
