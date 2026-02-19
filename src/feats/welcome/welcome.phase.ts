import { ApiBlockingUi, IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { LoginPhase } from '../login';
import { WelcomeUi } from './welcome.ui';
import { ErrorCode } from '@poposafari/types';
import { TitlePhase } from '../title';

export class WelcomePhase implements IGamePhase {
  private ui!: WelcomeUi;
  private blocker!: ApiBlockingUi;

  private isUser: boolean = true;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    const inputManager = this.scene.getInputManager();
    this.blocker = new ApiBlockingUi(this.scene);

    try {
      const res = await this.scene.getApi().getUser();

      this.blocker.blockInput();

      if (res) {
        this.scene.createUserManager(res);
        this.blocker.unblockInput();
        this.scene.pushPhase(new TitlePhase(this.scene));
        return;
      }
    } catch (error: any) {
      this.isUser = false;
      console.log(error.code);
      if (error.code === ErrorCode.USER_NOT_FOUND) {
      } else if (
        error.code === ErrorCode.ERR_BAD_REQUEST ||
        error.code === ErrorCode.RT_MISSING ||
        error.code === ErrorCode.NETWORK_ERROR
      ) {
        this.blocker.unblockInput();
        this.scene.switchPhase(new LoginPhase(this.scene));
        return;
      }
    }

    if (!this.isUser) {
      this.ui = new WelcomeUi(this.scene, inputManager);
      this.ui.show();

      await this.ui.showWelcomeMsg();
      this.blocker.unblockInput();
      this.scene.pushPhase(new TitlePhase(this.scene));
    }
  }

  exit(): void {
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
    }
    this.blocker.hide();
    this.blocker.destroy();
  }
}
