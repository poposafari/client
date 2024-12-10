import { MODE } from './enums/mode';
import { Account } from './interface/sys';
import { ModeManager } from './managers';
import { Mode } from './mode';
import { InGameScene } from './scenes/ingame-scene';
import { LoginUi } from './ui/login-ui';
import { NewGameUi } from './ui/newgame-ui';
import { RegisterUi } from './ui/register-ui';
import { LabOverworld } from './ui/lab-overworld';
import { TitleUi } from './ui/title-ui';
import { BagUi } from './ui/bag-ui';
import { Overworld } from './ui/overworld';

export class NoneMode extends Mode {
  constructor(scene: InGameScene, manager: ModeManager) {
    super(scene, manager);
  }

  init(): void {}

  enter(): void {
    //TODO: 분기점을 언젠가는 넣어야 한다. 로그인이 되어 있는 상태면, TITLE 모드로 변경되어야하고, 아니라면, LOGIN 모드로 변경되어야 한다.
    this.manager.changeMode(MODE.OVERWORLD);
  }
  exit(): void {}

  update(): void {}
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
  update(): void {}

  changeRegisterMode() {
    this.manager.changeMode(MODE.REGISTER);
  }

  submit(data: Account): void {
    console.log('login submit');
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
  update(): void {}

  changeLoginMode() {
    this.manager.changeMode(MODE.LOGIN);
  }

  submit(data: Account): void {
    console.log('register submit');
  }
}

export class TitleMode extends Mode {
  constructor(scene: InGameScene, manager: ModeManager) {
    super(scene, manager);
  }

  init(): void {
    this.ui = new TitleUi(this.scene, this);
    this.ui.setup();
  }

  enter(): void {
    //user data load.

    this.ui.show();
  }

  exit(): void {
    this.ui.clean();
  }
  update(): void {}

  changeLoginMode() {
    this.manager.changeMode(MODE.LOGIN);
  }
}

export class NewGameMode extends Mode {
  constructor(scene: InGameScene, manager: ModeManager) {
    super(scene, manager);
  }

  init(): void {
    this.ui = new NewGameUi(this.scene, this);
    this.ui.setup();
  }

  enter(): void {
    this.ui.show();
  }
  update(): void {}

  exit(): void {}
}

export class OverworldMode extends Mode {
  private currentOverworld!: Overworld;

  constructor(scene: InGameScene, manager: ModeManager) {
    super(scene, manager);
  }

  init(): void {
    this.ui = new LabOverworld(this.scene, this);
    // this.ui = new SeasonUi(this.scene, this);
    this.ui.setup();
  }

  enter(): void {
    this.ui.show();
  }

  exit(): void {
    this.ui.clean();
  }

  update(time: number, delta: number): void {
    this.ui.update(time, delta);
  }

  changeBagMode() {
    this.manager.changeMode(MODE.BAG);
  }
}

export class BagMode extends Mode {
  constructor(scene: InGameScene, manager: ModeManager) {
    super(scene, manager);
  }

  init(): void {
    this.ui = new BagUi(this.scene, this);
    this.ui.setup();
  }

  enter(): void {
    this.ui.show();
  }

  exit(): void {
    this.ui.clean();
  }

  update(time: number, delta: number): void {}

  changeOverworldMode() {
    this.manager.changeMode(MODE.OVERWORLD);
  }
}
