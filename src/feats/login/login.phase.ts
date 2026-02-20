import i18next from 'i18next';
import { ApiBlockingUi, IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { LoginUi } from './login.ui';
import { RegisterPhase } from '../register';
import { WelcomePhase } from '../welcome/welcome.phase';

export interface LoginPhaseOptions {
  initialErrorKey?: string;
}

export class LoginPhase implements IGamePhase {
  private ui!: LoginUi;
  private blocker!: ApiBlockingUi;

  constructor(
    private scene: GameScene,
    private options?: LoginPhaseOptions,
  ) {}

  async enter(): Promise<void> {
    this.ui = new LoginUi(this.scene);
    this.blocker = new ApiBlockingUi(this.scene);

    this.ui.show();

    if (this.options?.initialErrorKey) {
      this.ui.setErrorText(i18next.t(this.options.initialErrorKey));
    }

    while (1) {
      const inputResult = await this.ui.waitForInput();

      this.blocker.blockInput();

      try {
        if (inputResult === 'register') {
          this.scene.switchPhase(new RegisterPhase(this.scene));
          return;
        } else {
          await this.scene.getApi().loginLocal(inputResult.username, inputResult.password);
          this.scene.switchPhase(new WelcomePhase(this.scene));
          return;
        }
      } catch (error: any) {
        this.ui.errorEffect(error.message);
      } finally {
        this.blocker.unblockInput();
      }
    }
  }

  exit(): void {
    this.ui.hide();
    this.ui.destroy();
    this.blocker.hide();
    this.blocker.destroy();
  }

  onRefreshLanguage(): void {
    this.ui.onRefreshLanguage();
  }
}
