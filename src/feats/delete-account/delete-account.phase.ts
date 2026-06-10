import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { QuestionMessageUi } from '@poposafari/feats/message/question-message.ui';
import { DeleteAccountUi } from './delete-account.ui';
import { DeleteAccountMenuUi } from './delete-account-menu.ui';
import i18next from 'i18next';
import { LoginPhase } from '../login';
import { showApiErrorAsTalk } from '@poposafari/utils';

export class DeleteAccountPhase implements IGamePhase {
  private ui!: DeleteAccountUi;
  private menuUi!: DeleteAccountMenuUi;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.menuUi = new DeleteAccountMenuUi(this.scene);
    this.ui = new DeleteAccountUi(this.scene, this.menuUi);

    this.ui.show();

    const result = await this.ui.runDeleteAccountFlow();

    if (result === 'confirmed') {
      try {
        await this.scene.getApi().deleteAccount();
      } catch (e) {
        await showApiErrorAsTalk(this.scene, e);
        this.scene.popPhase();
        return;
      }
      this.scene.resetSessionState();
      this.scene.switchPhase(new LoginPhase(this.scene));
      return;
    } else {
      this.scene.popPhase();
      return;
    }
  }

  exit(): void {
    this.ui.hide();
    this.ui.destroy();
    this.menuUi.hide();
    this.menuUi.destroy();
  }

  onRefreshLanguage(): void {
    this.menuUi.onRefreshLanguage();
  }
}
