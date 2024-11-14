import { MODE } from './enums/mode';
import { ModeManager } from './managers';
import { Mode } from './mode';
import { InGameScene } from './scenes/ingame-scene';
import { LoginUi } from './ui/login-ui';
import { RegisterUi } from './ui/register-ui';

export class NoneMode extends Mode {
  constructor(scene: InGameScene, manager: ModeManager) {
    super(scene, manager);
  }

  init(): void {}

  enter(): void {
    this.manager.changeMode(MODE.LOGIN);
  }
  exit(): void {}
}

export class LoginMode extends Mode {
  constructor(scene: InGameScene, manager: ModeManager) {
    super(scene, manager);
  }

  init(): void {
    this.ui = new LoginUi(this.scene, this);
    this.ui.setup();
  }

  enter(): void {
    this.ui.show();
  }
  exit(): void {
    this.ui.clean();
  }

  changeRegisterMode() {
    this.manager.changeMode(MODE.REGISTER);
  }
}

export class RegisterMode extends Mode {
  constructor(scene: InGameScene, manager: ModeManager) {
    super(scene, manager);
  }

  init(): void {
    this.ui = new RegisterUi(this.scene, this);
    this.ui.setup();
  }

  enter(): void {
    this.ui.show();
  }

  exit(): void {
    this.ui.clean();
  }

  changeLoginMode() {
    this.manager.changeMode(MODE.LOGIN);
  }
}
