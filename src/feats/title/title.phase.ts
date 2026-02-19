import { ApiBlockingUi, IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { TitleUi } from './title.ui';
import { LoginPhase } from '../login';
import { OptionPhase } from '../option/option.phase';
import { MysteryGiftPhase } from '../mysterygift/mysterygift.phase';
import { CreateAvatarPhase } from '../tutorial';
import { DeleteAccountPhase } from '../delete-account/delete-account.phase';
import { OverworldPhase } from '../overworld/overworld.phase';

export class TitlePhase implements IGamePhase {
  private ui!: TitleUi;
  private blocker!: ApiBlockingUi;

  /** 옵션/미스터리기프트 등에서 복귀 시 커서 복원용 */
  private savedCursorIndex: number | undefined = undefined;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new TitleUi(this.scene, this.scene.getUser() ? true : false);
    this.blocker = new ApiBlockingUi(this.scene);

    this.ui.show();
    await this.runMenuOnce();
  }

  /** 메뉴 한 번 표시 → 선택 처리. 복귀 시 savedCursorIndex로 커서 복원. */
  private async runMenuOnce(): Promise<void> {
    const result = await this.ui.waitForInput(this.savedCursorIndex);
    this.savedCursorIndex = result.cursorIndex;

    try {
      if (result.input === 'continue') {
        if (this.scene.getUser()) {
          this.scene.switchPhase(new OverworldPhase(this.scene));
          return;
        }
        await this.runMenuOnce();
        return;
      }
      if (result.input === 'newgame') {
        if (!this.scene.getUser()) {
          this.scene.switchPhase(new CreateAvatarPhase(this.scene));
          return;
        }
        this.scene.pushPhase(new DeleteAccountPhase(this.scene));
        return;
      }
      if (result.input === 'mystery_gift') {
        this.scene.pushPhase(new MysteryGiftPhase(this.scene));
        return;
      }
      if (result.input === 'option') {
        this.scene.pushPhase(new OptionPhase(this.scene));
        return;
      }
      // logout
      this.blocker.blockInput();
      await this.scene.getApi().logout();
      this.scene.clearUser();
      this.blocker.unblockInput();
      this.scene.switchPhase(new LoginPhase(this.scene));
    } catch (error: any) {
      await this.ui.waitForError(error);
      await this.runMenuOnce();
    }
  }

  exit(): void {
    this.ui.hide();
    this.ui.destroy();
    this.blocker.destroy();
  }

  onResume(): void {
    this.ui.updateBg();
    this.runMenuOnce();
  }

  onRefreshLanguage(): void {
    this.ui.onRefreshLanguage();
  }
}
