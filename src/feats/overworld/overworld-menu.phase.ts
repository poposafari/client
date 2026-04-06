import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { OverworldMenuUi } from './overworld-menu.ui';
import { OptionPhase } from '../option';
import { BackTitleMenuUi } from './back-title-menu.ui';
import { TitlePhase } from '../title';
import { PokemonPcPhase } from '../pc/pokemon-pc.phase';
import { MenuUi } from '../menu/menu-ui';
import { InitPosConfig } from './maps/door';
import { MAP } from '@poposafari/types';
import i18next from '@poposafari/i18n';

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('menu:yes') },
  { key: 'no', label: i18next.t('menu:no') },
];

export class OverworldMenuPhase implements IGamePhase {
  private ui!: OverworldMenuUi;
  private yesOrNoMenu!: BackTitleMenuUi;
  private confirmMenu: MenuUi | null = null;

  private savedCursorIndex: number | undefined = undefined;

  constructor(private scene: GameScene) {}

  private isInSafari(): boolean {
    const map = this.scene.getUser()?.getProfile().lastLocation.map ?? '';
    return map.startsWith('s');
  }

  async enter(): Promise<void> {
    this.ui = new OverworldMenuUi(this.scene, this.isInSafari() ? 820 : 720);
    this.yesOrNoMenu = new BackTitleMenuUi(this.scene);
    this.confirmMenu = new MenuUi(this.scene, this.scene.getInputManager(), {
      y: +800,
      itemHeight: 80,
    });
    await this.runMenuOnce();
  }

  private async runMenuOnce(): Promise<void> {
    const result = await this.ui.waitForInput(this.savedCursorIndex);
    this.savedCursorIndex = result.cursorIndex;

    if (result.key === 'pc') {
      this.scene.pushPhase(new PokemonPcPhase(this.scene));
      return;
    }

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
      return;
    }
    if (result.key === 'plaza') {
      const question = this.scene.getMessage('question');
      await question.showMessage(i18next.t('msg:backToPlaza'), {
        resolveWhen: 'displayed',
      });
      const ret = await this.confirmMenu!.waitForSelect(YES_NO_ITEMS());
      this.confirmMenu!.hide();
      question.hide();
      const choice = ret?.key ?? 'no';

      if (choice === 'yes') {
        try {
          const exitData = await this.scene.getApi().exitSafari();
          if (!exitData) {
            await this.runMenuOnce();
            return;
          }
          this.scene.clearSafariInfo();
          const initPos: InitPosConfig = {
            location: exitData.mapId as MAP,
            x: exitData.entry.x,
            y: exitData.entry.y,
          };
          this.scene.startMapTransitionWithFade(initPos);
          return;
        } catch {
          await this.runMenuOnce();
          return;
        }
      }
      await this.runMenuOnce();
      return;
    }
  }

  exit(): void {
    this.ui.hide();
    this.ui.destroy();

    this.yesOrNoMenu.destroy();
    if (this.confirmMenu) {
      this.confirmMenu.hide();
      this.confirmMenu.destroy();
    }
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
