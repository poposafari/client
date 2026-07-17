import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { screenFadeIn } from '@poposafari/utils';
import { MAP, PokemonHiddenMove } from '@poposafari/types';
import { MenuUi } from '@poposafari/feats/menu/menu-ui';
import { InitPosConfig } from '@poposafari/feats/overworld/maps/door';
import i18next from 'i18next';
import { SafariMapUi } from './safari-map.ui';

const FLY_MOVE_ID: PokemonHiddenMove = 'move_fly';

export class SafariMapPhase implements IGamePhase {
  private ui: SafariMapUi | null = null;
  private menuUi: MenuUi | null = null;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new SafariMapUi(this.scene);
    this.ui.show();
    screenFadeIn(this.scene, { duration: 800 });

    const question = this.scene.getMessage('question');
    this.menuUi = new MenuUi(this.scene, this.scene.getInputManager(), {
      y: +800,
      itemHeight: 70,
    });

    while (true) {
      const dest = await this.ui.waitForInput();

      if (!dest) {
        this.scene.popPhase();
        return;
      }

      const user = this.scene.getUser();

      if (!user || user.getProfile().lastLocation.map === dest) {
        continue;
      }

      const hasFly = user.getParty().some((p) => {
        const skills = (p.skills as PokemonHiddenMove[] | null | undefined) ?? [];
        return skills.includes(FLY_MOVE_ID);
      });
      if (!hasFly) {
        continue;
      }

      await question.showMessage(
        i18next.t('safari:confirmFly', { map: i18next.t(`map:${dest}`) }),
        {
          resolveWhen: 'displayed',
        },
      );
      const choice = await this.menuUi.waitForSelect([
        { key: 'yes', label: i18next.t('etc:yes') },
        { key: 'no', label: i18next.t('etc:no') },
      ]);
      this.menuUi.hide();
      question.hide();

      if (choice?.key !== 'yes') {
        continue;
      }

      const initPos: InitPosConfig = {
        location: dest as MAP,
        x: 0,
        y: 0,
        useMapEntry: true,
      };
      await this.scene.startMapTransitionWithFade(initPos);
      return;
    }
  }

  update(time: number, delta: number): void {
    this.ui?.update(time, delta);
  }

  exit(): void {
    if (this.menuUi) {
      this.menuUi.destroy();
      this.menuUi = null;
    }
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
      this.ui = null;
    }
  }
}
