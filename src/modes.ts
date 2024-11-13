import { MODE } from './enums/mode';
import { Mode } from './mode';
import { InGameScene } from './scenes/ingame-scene';
import { LoginUi } from './ui/login-ui';

export class NoneMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }
  init(): void {}

  enter(): void {
    this.manager.changeMode(MODE.LOGIN);
  }
  exit(): void {}
}

export class LoginMode extends Mode {
  init(): void {
    this.ui = new LoginUi(this.scene);
    this.ui.setup();
  }

  enter(): void {
    this.ui.show();
  }
  exit(): void {}
}
