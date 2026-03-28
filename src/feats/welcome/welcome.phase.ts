import { ApiBlockingUi, IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { LoginPhase } from '../login';
import { WelcomeUi } from './welcome.ui';
import { ApiError, ErrorCode } from '@poposafari/types';
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
      const res = await this.scene.getApi().getMe();

      this.blocker.blockInput();

      if (res) {
        this.scene.createUserManager(res);
        this.blocker.unblockInput();
        this.scene.pushPhase(new TitlePhase(this.scene));
        return;
      }
    } catch (error: any) {
      this.isUser = false;
      const errorCode = error instanceof ApiError ? error.code : error.code;

      // 계정은 있지만 캐릭터 미생성 → 캐릭터 생성 화면으로 분기
      if (errorCode === ErrorCode.USER_NOT_FOUND) {
        this.blocker.unblockInput();
        // isUser = false 상태로 계속 진행 → 아래에서 WelcomeUi 표시
      } else {
        this.blocker.unblockInput();
        this.scene.switchPhase(new LoginPhase(this.scene, { initialErrorKey: errorCode }));
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
