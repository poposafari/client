import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { MenuUi } from '@poposafari/feats/menu/menu-ui';
import { IMenuItem, MAP } from '@poposafari/types';
import { InitPosConfig } from '@poposafari/feats/overworld/maps/door';
import { SafariZoneListUi } from './safari-zone-list.ui';
import i18next from 'i18next';

interface SafariZone {
  key: string;
  labelKey: string;
  mapId: MAP;
  spawnX: number;
  spawnY: number;
}

const SAFARI_ZONES: SafariZone[] = [
  { key: 's001', labelKey: 'safari:zone1', mapId: MAP.SAFARI_001, spawnX: 10, spawnY: 10 },
  { key: 's002', labelKey: 'safari:zone2', mapId: MAP.SAFARI_002, spawnX: 10, spawnY: 10 },
];

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('menu:yes') },
  { key: 'no', label: i18next.t('menu:no') },
];

export class SafariPhase implements IGamePhase {
  private zoneListUi: SafariZoneListUi | null = null;
  private menuUi: MenuUi | null = null;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    const talk = this.scene.getMessage('talk');

    await talk.showMessage(i18next.t('safari:greeting1'));
    await talk.showMessage(i18next.t('safari:greeting2'));

    this.zoneListUi = new SafariZoneListUi(this.scene);
    this.menuUi = new MenuUi(this.scene, this.scene.getInputManager(), {
      y: +800,
      itemHeight: 70,
    });

    await this.showZoneSelection();
  }

  private async showZoneSelection(): Promise<void> {
    const question = this.scene.getMessage('question');

    const items: IMenuItem[] = SAFARI_ZONES.map((zone) => ({
      key: zone.key,
      label: i18next.t(zone.labelKey),
    }));

    while (true) {
      const selected = await this.zoneListUi!.waitForSelect(items);

      if (!selected) {
        this.scene.popPhase();
        return;
      }

      const zone = SAFARI_ZONES.find((z) => z.key === selected.key);
      if (!zone) continue;

      this.zoneListUi!.hide();

      await question.showMessage(
        i18next.t('safari:confirmMove', { map: i18next.t(zone.labelKey) }),
        { resolveWhen: 'displayed' },
      );
      const choice = await this.menuUi!.waitForSelect(YES_NO_ITEMS());

      if (choice?.key === 'yes') {
        try {
          const result = await this.scene.getApi().enterSafari(zone.key, true);
          if (!result) {
            this.menuUi!.hide();
            question.hide();
            continue;
          }

          this.scene.setSafariInfo({ [result.mapId]: result.mapInfo });

          const entry = result.mapInfo.entry;
          const initPos: InitPosConfig = {
            location: zone.mapId,
            x: entry?.x ?? zone.spawnX,
            y: entry?.y ?? zone.spawnY,
          };
          this.scene.startMapTransitionWithFade(initPos);
          return;
        } catch {
          this.menuUi!.hide();
          question.hide();
          continue;
        }
      }

      this.menuUi!.hide();
      question.hide();
    }
  }

  exit(): void {
    this.scene.getMessage('question').hide();
    this.zoneListUi?.hide();
    this.zoneListUi?.destroy();
    this.zoneListUi = null;
    this.menuUi?.hide();
    this.menuUi?.destroy();
    this.menuUi = null;
  }

  update?(time: number, delta: number): void {}

  onPause?(): void {}

  onResume?(): void {}

  onRefreshLanguage?(): void {}
}
