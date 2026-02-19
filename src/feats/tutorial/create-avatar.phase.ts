import { ApiBlockingUi, IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { ErrorCode } from '@poposafari/types';
import { CreateAvatarUi } from './create-avatar.ui';
import { OverworldPhase } from '../overworld/overworld.phase';

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

        const res = await this.scene.getApi().createUser(inputResult);

        if (res) {
          this.scene.createUserManager(res);
        }

        this.scene.switchPhase(new OverworldPhase(this.scene));
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
