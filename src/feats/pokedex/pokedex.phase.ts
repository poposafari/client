import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { IMenuItem } from '@poposafari/types';
import { screenFadeIn } from '@poposafari/utils';
import i18next from '@poposafari/i18n';
import { PokedexUi } from './pokedex.ui';
import { PokedexListUi } from './pokedex-list.ui';
import { PokedexFilterUi } from './pokedex-filter.ui';

const TOTAL_POKEDEX = 1025;
const NAME_MASK = '----------';

const FILTER_KEYS = [
  'etc:pokedexFilter_all',
  'etc:pokedexFilter_1',
  'etc:pokedexFilter_2',
  'etc:pokedexFilter_3',
  'etc:pokedexFilter_4',
  'etc:pokedexFilter_5',
  'etc:pokedexFilter_6',
  'etc:pokedexFilter_7',
  'etc:pokedexFilter_8',
  'etc:pokedexFilter_9',
] as const;

const GEN_RANGES: ReadonlyArray<{ from: number; to: number }> = [
  { from: 1, to: TOTAL_POKEDEX },
  { from: 1, to: 151 },
  { from: 152, to: 251 },
  { from: 252, to: 386 },
  { from: 387, to: 493 },
  { from: 494, to: 649 },
  { from: 650, to: 721 },
  { from: 722, to: 809 },
  { from: 810, to: 905 },
  { from: 906, to: TOTAL_POKEDEX },
];

function baseId(id: string): string {
  return id.split(/[-_]/)[0].padStart(4, '0');
}

export class PokedexPhase implements IGamePhase {
  private ui: PokedexUi | null = null;
  private listUi: PokedexListUi | null = null;
  private filterUi: PokedexFilterUi | null = null;

  private filterIdx = 0;
  private lastItems: IMenuItem[] = [];

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.ui = new PokedexUi(this.scene);
    this.ui.show();

    this.filterUi = new PokedexFilterUi(
      this.scene,
      FILTER_KEYS.map((k) => i18next.t(k)),
      i18next.t('etc:pokedexCountLabel'),
    );
    this.filterUi.show();

    this.listUi = new PokedexListUi(this.scene);
    this.listUi.onCursorMove = (_idx, item) => this.ui?.updateInfo(item.key);
    this.listUi.onFilterShift = (delta) => this.shiftFilter(delta);

    this.applyFilter();
    screenFadeIn(this.scene, { duration: 800 });

    if (this.lastItems.length > 0) this.ui.updateInfo(this.lastItems[0].key);
    this.listUi.setItems(this.lastItems);

    while (true) {
      const selected = await this.listUi.waitForSelect();
      if (!selected) break;
    }

    this.scene.popPhase();
  }

  private shiftFilter(delta: -1 | 1): void {
    const total = FILTER_KEYS.length;
    this.filterIdx = (this.filterIdx + delta + total) % total;
    this.applyFilter();
    if (this.listUi) {
      this.listUi.setItems(this.lastItems);
      if (this.lastItems.length > 0) this.ui?.updateInfo(this.lastItems[0].key);
    }
  }

  private applyFilter(): void {
    this.lastItems = this.buildItems(this.filterIdx);
    const caught = this.lastItems.filter((i) => i.ownedIcon).length;
    const total = this.lastItems.length;
    this.filterUi?.setActiveFilter(this.filterIdx);
    this.filterUi?.setCounts(caught, total);
  }

  private buildItems(filterIdx: number): IMenuItem[] {
    const masterData = this.scene.getMasterData();
    const user = this.scene.getUser();
    const pokedex = user?.getPokedex() ?? [];

    const caughtBaseSet = new Set(
      pokedex.filter((p) => p.caughtCount > 0).map((p) => baseId(p.pokedexId)),
    );
    const caughtKeySet = new Set(
      pokedex.filter((p) => p.caughtCount > 0).map((p) => p.pokedexId),
    );

    const regionalByBase = new Map<string, string[]>();
    for (const key of masterData.getPokemonDataKeys()) {
      const sep = key.indexOf('_');
      if (sep <= 0) continue;
      const base = key.slice(0, sep);
      if (!/^\d{4}$/.test(base)) continue;
      const arr = regionalByBase.get(base);
      if (arr) arr.push(key);
      else regionalByBase.set(base, [key]);
    }
    for (const arr of regionalByBase.values()) arr.sort();

    const range = GEN_RANGES[filterIdx];
    const items: IMenuItem[] = [];
    for (let i = range.from; i <= range.to; i++) {
      const id = String(i).padStart(4, '0');
      if (!masterData.getPokemonData(id)) continue;

      const isBaseSeen = caughtBaseSet.has(id);
      const baseName = isBaseSeen
        ? i18next.t(`pokemon:${id}.name`, { defaultValue: id })
        : NAME_MASK;
      items.push({
        key: id,
        label: `${id}  ${baseName}`,
        ownedIcon: caughtKeySet.has(id),
      });

      const variants = regionalByBase.get(id);
      if (!variants) continue;
      for (const vKey of variants) {
        const isVariantSeen = caughtKeySet.has(vKey);
        const variantName = isVariantSeen
          ? i18next.t(`pokemon:${vKey}.name`, { defaultValue: vKey })
          : NAME_MASK;
        items.push({
          key: vKey,
          label: `${id}  ${variantName}`,
          ownedIcon: isVariantSeen,
        });
      }
    }
    return items;
  }

  exit(): void {
    if (this.listUi) {
      this.listUi.hide();
      this.listUi.destroy();
      this.listUi = null;
    }
    if (this.filterUi) {
      this.filterUi.hide();
      this.filterUi.destroy();
      this.filterUi = null;
    }
    if (this.ui) {
      this.ui.hide();
      this.ui.destroy();
      this.ui = null;
    }
  }

  onPause?(): void {}
  onResume?(): void {}
}
