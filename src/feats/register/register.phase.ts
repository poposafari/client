import i18next from 'i18next';
import { IGamePhase } from '@poposafari/core';
import { ApiError } from '@poposafari/types';
import { GameScene } from '@poposafari/scenes';
import { RegisterUi } from './register.ui';
import { LoginPhase } from '../login';
import { WelcomePhase } from '../welcome/welcome.phase';

export class RegisterPhase implements IGamePhase {
  private ui!: RegisterUi;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new RegisterUi(this.scene);

    this.ui.show();

    while (1) {
      const inputResult = await this.ui.waitForInput();

      try {
        if (inputResult === 'login') {
          this.scene.switchPhase(new LoginPhase(this.scene));
          return;
        } else {
          await this.scene.getApi().registerLocal(inputResult.username, inputResult.password);
          this.scene.switchPhase(new WelcomePhase(this.scene));
          return;
        }
      } catch (error: any) {
        if (error instanceof ApiError && error.status === 503) {
          this.ui.errorEffect(i18next.t('error:MAINTENANCE'));
        } else {
          this.ui.errorEffect(error.message);
        }
      }
    }
  }

  exit(): void {
    this.ui.hide();
    this.ui.destroy();
  }

  onRefreshLanguage(): void {
    this.ui.onRefreshLanguage();
  }
}
