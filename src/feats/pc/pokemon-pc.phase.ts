import { IGamePhase } from '@poposafari/core';
import { UserManager } from '@poposafari/core/user.manager';
import { PokemonPcUi } from './pokemon-pc.ui';
import { GameScene } from '@poposafari/scenes';
import { PcLocalState } from './pc-local-state';
import type { BoxMetaItem, PokemonBoxItem } from '@poposafari/types/dto';

export class PokemonPcPhase implements IGamePhase {
  private pokemonPcUi: PokemonPcUi | null = null;
  private pcState: PcLocalState = new PcLocalState();

  constructor(private scene: GameScene) {}

  enter(): void {
    const api = this.scene.getApi();
    const user = this.scene.getUser();
    if (!user) return;

    const cached = user.getPokemonBox();
    if (cached) {
      api.getBoxMeta().then((meta) => {
        this.initPcUi(cached, user, meta ?? []);
      });
    } else {
      Promise.all([api.getPokemonBox(), api.getBoxMeta()]).then(([boxPokemons, meta]) => {
        if (!boxPokemons) return;
        user.setPokemonBox(boxPokemons);
        this.initPcUi(boxPokemons, user, meta ?? []);
      });
    }
  }

  private initPcUi(boxPokemons: PokemonBoxItem[], user: UserManager, boxMeta: BoxMetaItem[]): void {
    this.pcState.init(boxPokemons, user.getParty(), boxMeta);
    this.pokemonPcUi = new PokemonPcUi(this.scene, this.pcState);
    this.pokemonPcUi.onClose = () => this.closePc();
    this.pokemonPcUi.show();
  }

  private async closePc() {
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
            gender: p.gender,
            isShiny: p.isShiny,
            nickname: p.nickname,
            abilityId: p.abilityId,
            natureId: p.natureId,
            skills: p.skills,
            heldItemId: p.heldItemId,
            partySlot: slotState.partySlot,
            ballId: p.ballId,
          };
        }),
      );

      user?.setPokemonBox(this.pcState.getAllBoxPokemons());
    }

    this.scene.popPhase();
  }

  exit(): void {
    this.pokemonPcUi?.hide();
    this.pokemonPcUi?.destroy();
  }
  update?(time: number, delta: number): void {}
  onPause?(): void {}
  onResume?(): void {}
  onRefreshLanguage?(): void {}
  onRefreshWindow?(): void {}
}
