import { ApiBlockingUi, IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { CreateAvatarUi } from './create-avatar.ui';
import { TitlePhase } from '../title';

export class CreateAvatarPhase implements IGamePhase {
  private ui!: CreateAvatarUi;
  private blocker!: ApiBlockingUi;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new CreateAvatarUi(this.scene);
    this.blocker = new ApiBlockingUi(this.scene);

    this.ui.show();

    await this.ui.showGuideMsg();

    while (1) {
      try {
        const inputResult = await this.ui.waitForInput();
        this.blocker.blockInput();

        await this.scene.getApi().createUser(inputResult);

        this.scene.getUser()?.reset();
        this.scene.switchPhase(new TitlePhase(this.scene, { forceContinueEnabled: true }));
        return;
      } catch (error: any) {
        this.ui.errorEffect(error.message);
      } finally {
        this.blocker.unblockInput();
      }
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

  onRefreshLanguage(): void {
    this.ui.onRefreshLanguage();
  }
}
