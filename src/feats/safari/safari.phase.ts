import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { MenuUi } from '@poposafari/feats/menu/menu-ui';
import { IMenuItem, MAP } from '@poposafari/types';
import { InitPosConfig } from '@poposafari/feats/overworld/maps/door';
import { SafariZoneListUi } from './safari-zone-list.ui';
import { showApiErrorAsTalk } from '@poposafari/utils';
import i18next from 'i18next';

interface SafariZone {
  key: string;
  labelKey: string;
  mapId: MAP;
  spawnX: number;
  spawnY: number;
}

const SAFARI_ZONES: SafariZone[] = [
  { key: 's046', labelKey: 'map:s046', mapId: MAP.SAFARI_046, spawnX: 10, spawnY: 10 },
  { key: 's001', labelKey: 'map:s001', mapId: MAP.SAFARI_001, spawnX: 10, spawnY: 10 },
  { key: 's002', labelKey: 'map:s002', mapId: MAP.SAFARI_002, spawnX: 10, spawnY: 10 },
  { key: 's003', labelKey: 'map:s003', mapId: MAP.SAFARI_003, spawnX: 10, spawnY: 10 },
  { key: 's004', labelKey: 'map:s004', mapId: MAP.SAFARI_004, spawnX: 10, spawnY: 10 },
  { key: 's005', labelKey: 'map:s005', mapId: MAP.SAFARI_005, spawnX: 10, spawnY: 10 },
  { key: 's006', labelKey: 'map:s006', mapId: MAP.SAFARI_006, spawnX: 10, spawnY: 10 },
  { key: 's007', labelKey: 'map:s007', mapId: MAP.SAFARI_007, spawnX: 10, spawnY: 10 },
  { key: 's012', labelKey: 'map:s012', mapId: MAP.SAFARI_012, spawnX: 10, spawnY: 10 },
  { key: 's013', labelKey: 'map:s013', mapId: MAP.SAFARI_013, spawnX: 10, spawnY: 10 },
  { key: 's014', labelKey: 'map:s014', mapId: MAP.SAFARI_014, spawnX: 10, spawnY: 10 },
  { key: 's017', labelKey: 'map:s017', mapId: MAP.SAFARI_017, spawnX: 10, spawnY: 10 },
  { key: 's019', labelKey: 'map:s019', mapId: MAP.SAFARI_019, spawnX: 10, spawnY: 10 },
  { key: 's021', labelKey: 'map:s021', mapId: MAP.SAFARI_021, spawnX: 10, spawnY: 10 },
  { key: 's022', labelKey: 'map:s022', mapId: MAP.SAFARI_022, spawnX: 10, spawnY: 10 },
  { key: 's023', labelKey: 'map:s023', mapId: MAP.SAFARI_023, spawnX: 10, spawnY: 10 },
  { key: 's039', labelKey: 'map:s039', mapId: MAP.SAFARI_039, spawnX: 10, spawnY: 10 },
  { key: 's040', labelKey: 'map:s040', mapId: MAP.SAFARI_040, spawnX: 10, spawnY: 10 },
];

const YES_NO_ITEMS = () => [
  { key: 'yes', label: i18next.t('etc:yes') },
  { key: 'no', label: i18next.t('etc:no') },
];

export class SafariPhase implements IGamePhase {
  private zoneListUi: SafariZoneListUi | null = null;
  private menuUi: MenuUi | null = null;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    const talk = this.scene.getMessage('talk');

    await talk.showMessage([i18next.t('safari:greeting1'), i18next.t('safari:greeting2')]);

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
        this.menuUi!.hide();
        question.hide();

        let pendingError: unknown = null;
        const ok = await this.scene.startMapTransitionWithFade(async () => {
          let result;
          try {
            result = await this.scene.getApi().enterSafari(zone.key, true);
          } catch (e) {
            pendingError = e;
            return null;
          }
          if (!result) return null;

          this.scene.setSafariInfo({ [result.mapId]: result.mapInfo });
          this.scene.getUser()?.addVisitedMap(result.mapId);

          const entry = result.mapInfo.entry;
          const initPos: InitPosConfig = {
            location: zone.mapId,
            x: entry?.x ?? zone.spawnX,
            y: entry?.y ?? zone.spawnY,
          };
          return initPos;
        });

        if (ok) return;
        if (pendingError) await showApiErrorAsTalk(this.scene, pendingError);
        continue;
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
