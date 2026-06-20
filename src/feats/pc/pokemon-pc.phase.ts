import { IGamePhase } from '@poposafari/core';
import { UserManager } from '@poposafari/core/user.manager';
import { PokemonPcUi } from './pokemon-pc.ui';
import { GameScene } from '@poposafari/scenes';
import { PcLocalState } from './pc-local-state';
import type { BoxMetaItem, PokemonBoxItem } from '@poposafari/types/dto';
import { DEPTH, OptionKey } from '@poposafari/types';
import i18next from 'i18next';

export class PokemonPcPhase implements IGamePhase {
  private pokemonPcUi: PokemonPcUi | null = null;
  private pcState: PcLocalState = new PcLocalState();
  private closing = false;
  private tutorialOverlay: Phaser.GameObjects.Rectangle | null = null;

  constructor(private scene: GameScene) {}

  enter(): void {
    const api = this.scene.getApi();
    const user = this.scene.getUser();
    if (!user) return;

    const cachedBox = user.getPokemonBox();
    const cachedMeta = user.getBoxMeta();
    const bagLoaded = user.isItemBagLoaded();

    if (cachedBox && cachedMeta && bagLoaded) {
      this.initPcUi(cachedBox, user, cachedMeta);
      return;
    }

    Promise.all([
      cachedBox ? Promise.resolve(cachedBox) : api.getPokemonBox(),
      cachedMeta ? Promise.resolve(cachedMeta) : api.getBoxMeta(),
      bagLoaded ? Promise.resolve(null) : api.getItemBag(),
    ]).then(([boxRes, metaRes, bagRes]) => {
      if (!boxRes) return;
      if (!cachedBox) user.setPokemonBox(boxRes);
      if (!cachedMeta && metaRes !== null) user.setBoxMeta(metaRes);
      if (!bagLoaded && bagRes) user.hydrateItemBag(bagRes);
      this.initPcUi(boxRes, user, metaRes ?? []);
    });
  }

  private initPcUi(boxPokemons: PokemonBoxItem[], user: UserManager, boxMeta: BoxMetaItem[]): void {
    this.pcState.init(boxPokemons, user.getParty(), boxMeta);
    this.pokemonPcUi = new PokemonPcUi(this.scene, this.pcState);
    this.pokemonPcUi.onClose = () => this.closePc();
    this.pokemonPcUi.show();

    void this.maybeShowTutorial();
  }

  private async maybeShowTutorial(): Promise<void> {
    const optionManager = this.scene.getOption();
    if (optionManager.getOption(OptionKey.PC_TUTORIAL) !== 0) return;

    const cam = this.scene.cameras.main;
    this.tutorialOverlay = this.scene.add
      .rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x000000, 0.6)
      .setScrollFactor(0)
      .setDepth(DEPTH.MESSAGE);

    try {
      await this.scene
        .getMessage('talk')
        .showMessage([
          i18next.t('pc:tutorial_0'),
          i18next.t('pc:tutorial_1'),
          i18next.t('pc:tutorial_2'),
          i18next.t('pc:tutorial_3'),
        ]);
    } finally {
      this.tutorialOverlay?.destroy();
      this.tutorialOverlay = null;
    }

    optionManager.updateOption(OptionKey.PC_TUTORIAL, 1);
    optionManager.saveToCache();
  }

  private async closePc() {
    if (this.closing) return;
    this.closing = true;
    this.pokemonPcUi?.lockInput();

    const changes = this.pcState.getChanges();
    const boxMetaChanges = this.pcState.getBoxMetaChanges();
    const nicknameChanges = this.pcState.getNicknameChanges();

    if (changes.length > 0 || boxMetaChanges.length > 0 || nicknameChanges.length > 0) {
      const api = this.scene.getApi();
      await api.patchPokemonArrange(
        changes,
        boxMetaChanges.length > 0 ? boxMetaChanges : undefined,
        nicknameChanges.length > 0 ? nicknameChanges : undefined,
      );

      const user = this.scene.getUser();
      const partyPokemons = this.pcState.getPartyPokemons();
      user?.setParty(
        partyPokemons.map((p) => {
          const slotState = this.pcState.getSlotState(p.id)!;
          return {
            id: p.id,
            pokedexId: p.pokedexId,
            level: p.level,
            exp: p.exp ?? 0,
            gender: p.gender,
            isShiny: p.isShiny,
            nickname: p.nickname,
            abilityId: p.abilityId,
            natureId: p.natureId,
            skills: p.skills,
            heldItemId: p.heldItemId,
            partySlot: slotState.partySlot,
            ballId: p.ballId,
            friendship: p.friendship,
            caughtLocation: p.caughtLocation,
            caughtAt: p.caughtAt,
          };
        }),
      );

      const updatedBox = this.pcState.getAllBoxPokemons();
      user?.setPokemonBox(updatedBox);
      user?.setPokemonBoxCount(updatedBox.length);
      user?.setBoxMeta(this.pcState.getBoxMetaSnapshot());
    }

    this.scene.popPhase();
  }

  exit(): void {
    this.tutorialOverlay?.destroy();
    this.tutorialOverlay = null;
    this.pokemonPcUi?.hide();
    this.pokemonPcUi?.destroy();
  }
  update?(time: number, delta: number): void {}
  onPause?(): void {}
  onResume?(): void {}
  onRefreshLanguage?(): void {}
  onRefreshWindow?(): void {}
}
