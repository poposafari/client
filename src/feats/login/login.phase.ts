import i18next from 'i18next';
import { IGamePhase } from '@poposafari/core';
import { ApiError } from '@poposafari/types';
import { GameScene } from '@poposafari/scenes';
import { LoginUi } from './login.ui';
import { RegisterPhase } from '../register';
import { WelcomePhase } from '../welcome/welcome.phase';

export interface LoginPhaseOptions {
  initialErrorKey?: string;
}

export class LoginPhase implements IGamePhase {
  private ui!: LoginUi;

  constructor(
    private scene: GameScene,
    private options?: LoginPhaseOptions,
  ) {}

  async enter(): Promise<void> {
    const existingSocket = this.scene.getSocket();
    if (existingSocket) {
      existingSocket.disconnect();
      this.scene.setSocket(null);
    }

    this.ui = new LoginUi(this.scene);

    this.ui.show();

    if (this.options?.initialErrorKey) {
      this.ui.setErrorText(i18next.t(this.options.initialErrorKey));
    }

    while (1) {
      const inputResult = await this.ui.waitForInput();

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
        if (error instanceof ApiError && error.status === 503) {
          await this.scene.getMessage('talk').showMessage(i18next.t('etc:maintenance_talk'));
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
