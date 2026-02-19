import { IGamePhase } from '@poposafari/core';
import { MysteryGiftUi } from './mysterygift.ui';
import { GameScene } from '@poposafari/scenes';
import { MenuListUi } from '../menu';
import { MysterygiftMenuUi } from './mysterygift-menu.ui';

export class MysteryGiftPhase implements IGamePhase {
  private ui!: MysteryGiftUi;
  private menuList!: MysterygiftMenuUi;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.menuList = new MysterygiftMenuUi(this.scene);
    this.ui = new MysteryGiftUi(this.scene, this.menuList);
    this.ui.show();

    while (1) {
      const inputResult = await this.ui.waitForInput();

      if (inputResult === null || inputResult.key === 'cancel') {
        this.scene.popPhase();
        return;
      } else {
        console.log(`선택된 선물: ${inputResult.label} (${inputResult.key})`);
        // 여기서 선물 수령 로직 처리...
      }
    }
  }

  exit(): void {
    this.menuList.hide();
    this.menuList.destroy();

    this.ui.hide();
    this.ui.destroy();
  }

  onRefreshLanguage(): void {
    this.menuList.onRefreshLanguage();
  }
}
