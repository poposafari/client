import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { OverworldMenuUi } from './overworld-menu.ui';
import { OptionPhase } from '../option';
import { BackTitleMenuUi } from './back-title-menu.ui';
import { TitlePhase } from '../title';

export class OverworldMenuPhase implements IGamePhase {
  private ui!: OverworldMenuUi;
  private yesOrNoMenu!: BackTitleMenuUi;

  /** 옵션 등에서 복귀 시 커서를 이전 위치로 복원하기 위해 저장 */
  private savedCursorIndex: number | undefined = undefined;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new OverworldMenuUi(this.scene);
    this.yesOrNoMenu = new BackTitleMenuUi(this.scene);
    await this.runMenuOnce();
  }

  /** 메뉴 표시 → 선택 대기 → cancel이면 pop, option이면 option phase push. 복귀 시 savedCursorIndex로 커서 복원. */
  private async runMenuOnce(): Promise<void> {
    const result = await this.ui.waitForInput(this.savedCursorIndex);
    this.savedCursorIndex = result.cursorIndex;

    if (result.key === 'cancel') {
      this.scene.popPhase();
      return;
    }
    if (result.key === 'option') {
      this.scene.pushPhase(new OptionPhase(this.scene));
      return;
    }
    if (result.key === 'title') {
      const choice = await this.yesOrNoMenu.waitForInput();
      this.yesOrNoMenu.hide();
      this.scene.getMessage('question').hide();
      if (choice === 'yes') {
        this.scene.switchPhase(new TitlePhase(this.scene));
        return;
      }
      await this.runMenuOnce();
    }
  }

  exit(): void {
    this.ui.hide();
    this.ui.destroy();

    this.yesOrNoMenu.destroy();
  }

  update?(time: number, delta: number): void {}

  onPause?(): void {}

  onResume?(): void {
    this.runMenuOnce();
  }

  onRefreshLanguage?(): void {
    this.ui.onRefreshLanguage();
  }

  onRefreshWindow?(): void {
    this.ui.updateWindow();
    this.yesOrNoMenu.updateWindow();
  }
}
