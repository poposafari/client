import { InGameScene } from '../scenes/ingame-scene';
import { Ui } from './ui';

export class DummyUi extends Ui {
  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {}

  show(data?: any): void {}

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}
