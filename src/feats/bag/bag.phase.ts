import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { ItemCategory, IMenuItem } from '@poposafari/types';
import type { PokemonBoxItem } from '@poposafari/types/dto';
import i18next from '@poposafari/i18n';
import { BagEntry, BagSelection, BagUi } from './bag.ui';
import { BAG_ACTIONS, BAG_CATEGORIES } from './bag.constants';
import { BagLocalState } from './bag-local-state';
import { MenuUi } from '../menu/menu-ui';
import { PokemonPcUi } from '../pc/pokemon-pc.ui';
import { PcLocalState } from '../pc/pc-local-state';
import { OverworldUi } from '../overworld/overworld.ui';
import { KeyItemRegistry } from '../key-items';

export class BagPhase implements IGamePhase {
  private ui: BagUi | null = null;
  private actionMenu: MenuUi | null = null;
  private confirmMenu: MenuUi | null = null;

  private savedCategoryIndex = 0;
  private localState = new BagLocalState();

  constructor(
    private scene: GameScene,
    private overworldUi: OverworldUi | null = null,
  ) {}

  async enter(): Promise<void> {
    const user = this.scene.getUser();
    const api = this.scene.getApi();
    if (!user) return;

    if (!user.isItemBagLoaded()) {
      user.clearItemBag();
      const bag = await api.getItemBag();
      if (bag) user.hydrateItemBag(bag);
    }

    this.localState.init(user.getItemBag());

    this.ui = new BagUi(this.scene, this.scene.getInputManager());
    this.ui.setRegisterLookup((itemId) => this.localState.isRegistered(itemId));
    this.actionMenu = new MenuUi(this.scene, this.scene.getInputManager(), {
      y: +1075,
      itemHeight: 80,
    });
    this.confirmMenu = new MenuUi(this.scene, this.scene.getInputManager(), {
      y: +805,
      itemHeight: 70,
    });

    this.refreshUiFromUser();
    this.runLoop();
  }

  private refreshUiFromUser(): void {
    const user = this.scene.getUser();
    const master = this.scene.getMasterData();
    if (!user || !this.ui) return;

    const entries: BagEntry[] = [];
    const bag = user.getItemBag();
    if (bag) {
      for (const [itemId, e] of bag) {
        entries.push({ itemId, quantity: e.quantity, register: e.register });
      }
    }
    this.ui.setBagData(entries, (itemId) => {
      const data = master.getItemData(itemId);
      return data ? (data.category as ItemCategory) : null;
    });
  }

  private async runLoop(): Promise<void> {
    if (!this.ui) return;
    while (this.ui) {
      const selection = await this.ui.showBag(this.savedCategoryIndex);
      this.savedCategoryIndex = BAG_CATEGORIES.indexOf(selection?.category ?? 'pokeball');

      if (!selection) {
        this.ui.hide();
        await this.flushRegisterChanges();
        this.scene.popPhase();
        return;
      }

      const handled = await this.handleItemSelection(selection);
      if (!handled) {
        await this.flushRegisterChanges();
        this.scene.popPhase();
        return;
      }
    }
  }

  private async handleItemSelection(selection: BagSelection): Promise<boolean> {
    const actions = BAG_ACTIONS[selection.category];
    const isRegistered = this.localState.isRegistered(selection.entry.itemId);
    const items: IMenuItem[] = actions
      .filter((a) => {
        if (a.key === 'register') return !isRegistered;
        if (a.key === 'deregister') return isRegistered;
        return true;
      })
      .map((a) => ({ key: a.key, label: i18next.t(a.i18n) }));
    const picked = await this.actionMenu!.waitForSelect(items);
    this.actionMenu!.hide();

    const key = picked?.key ?? 'cancel';
    if (key === 'cancel') return true;

    if (key === 'give') {
      await this.doGive(selection.entry.itemId);
      return true;
    }
    if (key === 'register' || key === 'deregister') {
      await this.doRegister(selection.entry.itemId);
      return true;
    }
    if (key === 'use') {
      if (selection.entry.itemId.startsWith('move_')) {
        await this.doTeachMove(selection.entry.itemId);
        return true;
      }
      if (selection.category === 'key' && this.overworldUi) {
        await KeyItemRegistry.use(selection.entry.itemId, {
          scene: this.scene,
          overworldUi: this.overworldUi,
        });
        return true;
      }
      const talk = this.scene.getMessage('talk');
      await talk.showMessage(i18next.t('bag:useStub'));
      talk.hide();
      return true;
    }
    return true;
  }

  private async doTeachMove(itemId: string): Promise<void> {
    const user = this.scene.getUser();
    const api = this.scene.getApi();
    if (!user) return;

    let boxPokemons = user.getPokemonBox();
    const metaPromise = api.getBoxMeta();
    if (!boxPokemons) {
      const fetched = await api.getPokemonBox();
      if (!fetched) return;
      user.setPokemonBox(fetched);
      boxPokemons = fetched;
    }
    const boxMeta = (await metaPromise) ?? [];

    const pcState = new PcLocalState();
    pcState.init(boxPokemons, user.getParty(), boxMeta);

    this.ui?.hide();

    const pcUi = new PokemonPcUi(this.scene, pcState, 'selectForTeachMove', itemId);

    try {
      while (true) {
        const selectedPokemon = await new Promise<PokemonBoxItem | null>((resolve) => {
          pcUi.onPokemonSelected = (p) => resolve(p);
          pcUi.onClose = () => resolve(null);
          pcUi.show();
        });
        if (!selectedPokemon) return;

        const pokemonName =
          selectedPokemon.nickname ??
          i18next.t(`pokemon:${selectedPokemon.pokedexId}.name`, selectedPokemon.pokedexId);
        const itemName = i18next.exists(`item:${itemId}.name`)
          ? i18next.t(`item:${itemId}.name`)
          : itemId;

        const questionUi = this.scene.getMessage('question');
        await questionUi.showMessage(
          i18next.t('bag:confirmLearnMove', { name: pokemonName, item: itemName }),
          { resolveWhen: 'displayed' },
        );
        const YES_NO_ITEMS = [
          { key: 'yes', label: i18next.t('menu:yes') },
          { key: 'no', label: i18next.t('menu:no') },
        ];
        const choice = await this.confirmMenu!.waitForSelect(YES_NO_ITEMS);
        this.confirmMenu!.hide();
        questionUi.hide();
        if (choice?.key !== 'yes') continue;

        const res = await api.learnMove(selectedPokemon.id, itemId);
        if (!res) return;

        user.decreaseItemQuantity(itemId, 1);

        const pokemonId = selectedPokemon.id;
        const cachedBox = user.getPokemonBox();
        if (cachedBox) {
          user.setPokemonBox(
            cachedBox.map((p) => (p.id === pokemonId ? { ...p, skills: res.skills } : p)),
          );
        }
        const party = user.getParty();
        const updatedParty = party.map((p) =>
          p.id === pokemonId ? { ...p, skills: res.skills } : p,
        );
        user.setParty(updatedParty);

        const talkUi = this.scene.getMessage('talk');
        await talkUi.showMessage(i18next.t('bag:learnedMove', { name: pokemonName, item: itemName }));
        talkUi.hide();
        return;
      }
    } finally {
      pcUi.hide();
      pcUi.destroy();
      this.refreshUiFromUser();
    }
  }

  private async doGive(itemId: string): Promise<void> {
    const user = this.scene.getUser();
    const api = this.scene.getApi();
    if (!user) return;

    let boxPokemons = user.getPokemonBox();
    const metaPromise = api.getBoxMeta();
    if (!boxPokemons) {
      const fetched = await api.getPokemonBox();
      if (!fetched) return;
      user.setPokemonBox(fetched);
      boxPokemons = fetched;
    }
    const boxMeta = (await metaPromise) ?? [];

    const pcState = new PcLocalState();
    pcState.init(boxPokemons, user.getParty(), boxMeta);

    this.ui?.hide();

    const pcUi = new PokemonPcUi(this.scene, pcState, 'selectForGive');

    try {
      while (true) {
        const selectedPokemon = await new Promise<PokemonBoxItem | null>((resolve) => {
          pcUi.onPokemonSelected = (p) => resolve(p);
          pcUi.onClose = () => resolve(null);
          pcUi.show();
        });
        if (!selectedPokemon) return;

        if (selectedPokemon.heldItemId !== null) {
          const questionUi = this.scene.getMessage('question');
          await questionUi.showMessage(i18next.t('bag:confirmReplaceHeld'), {
            resolveWhen: 'displayed',
          });
          const YES_NO_ITEMS = [
            { key: 'yes', label: i18next.t('menu:yes') },
            { key: 'no', label: i18next.t('menu:no') },
          ];
          const choice = await this.confirmMenu!.waitForSelect(YES_NO_ITEMS);
          this.confirmMenu!.hide();
          questionUi.hide();
          if (choice?.key !== 'yes') continue;
        }

        const pokemonId = selectedPokemon.id;
        const res = await api.giveHold(pokemonId, itemId);
        if (!res) return;

        user.decreaseItemQuantity(itemId, 1);
        if (res.previousHeld) {
          const existing = user.getItemBag()?.get(res.previousHeld);
          user.updateItemQuantity(
            res.previousHeld,
            (existing?.quantity ?? 0) + 1,
            existing?.register,
          );
        }
        const party = user.getParty();
        const updatedParty = party.map((p) =>
          p.id === pokemonId ? { ...p, heldItemId: res.heldItem } : p,
        );
        user.setParty(updatedParty);

        const cachedBox = user.getPokemonBox();
        if (cachedBox) {
          user.setPokemonBox(
            cachedBox.map((p) => (p.id === pokemonId ? { ...p, heldItemId: res.heldItem } : p)),
          );
        }

        const pokemonName =
          selectedPokemon.nickname ??
          i18next.t(`pokemon:${selectedPokemon.pokedexId}.name`, selectedPokemon.pokedexId);
        const itemName = i18next.exists(`item:${itemId}.name`)
          ? i18next.t(`item:${itemId}.name`)
          : itemId;
        const talkUi = this.scene.getMessage('talk');
        await talkUi.showMessage(i18next.t('bag:gaveItem', { name: pokemonName, item: itemName }));
        talkUi.hide();
        return;
      }
    } finally {
      pcUi.hide();
      pcUi.destroy();
      this.refreshUiFromUser();
    }
  }

  private async doRegister(itemId: string): Promise<void> {
    this.localState.toggleRegister(itemId);
    this.refreshUiFromUser();
  }

  private async flushRegisterChanges(): Promise<void> {
    const user = this.scene.getUser();
    const api = this.scene.getApi();
    if (!user) return;

    const changes = this.localState.getChanges();
    for (const { itemId, register } of changes) {
      const res = register ? await api.registerItem(itemId) : await api.unregisterItem(itemId);
      if (!res) continue;
      user.updateItemQuantity(res.itemId, res.quantity, res.register);
      this.localState.markCommitted(res.itemId, res.register);
    }
  }

  exit(): void {
    this.ui?.hide();
    this.ui?.destroy();
    this.ui = null;
    this.actionMenu?.hide();
    this.actionMenu?.destroy();
    this.actionMenu = null;
    this.confirmMenu?.hide();
    this.confirmMenu?.destroy();
    this.confirmMenu = null;
  }

  onRefreshLanguage?(): void {
    this.ui?.onRefreshLanguage();
  }

  onRefreshWindow?(): void {
    this.ui?.updateWindow();
  }
}
