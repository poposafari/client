import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { CreateAvatarUi } from './create-avatar.ui';
import { TitlePhase } from '../title';

export class CreateAvatarPhase implements IGamePhase {
  private ui!: CreateAvatarUi;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new CreateAvatarUi(this.scene);

    this.ui.show();

    await this.ui.showGuideMsg();

    while (1) {
      try {
        const inputResult = await this.ui.waitForInput();

        await this.scene.getApi().createUser(inputResult);

        this.scene.getUser()?.reset();
        this.scene.switchPhase(new TitlePhase(this.scene, { forceContinueEnabled: true }));
        return;
      } catch (error: any) {
        this.ui.errorEffect(error.message);
      }
    }
  }

  exit(): void {
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
    }
  }

  onRefreshLanguage(): void {
    this.ui.onRefreshLanguage();
  }
}
