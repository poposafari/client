import { ApiBlockingUi, IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { RegisterUi } from './register.ui';
import { LoginPhase } from '../login';
import { WelcomePhase } from '../welcome/welcome.phase';

export class RegisterPhase implements IGamePhase {
  private ui!: RegisterUi;
  private blocker!: ApiBlockingUi;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new RegisterUi(this.scene);
    this.blocker = new ApiBlockingUi(this.scene);

    this.ui.show();

    while (1) {
      const inputResult = await this.ui.waitForInput();

      this.blocker.blockInput();

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
