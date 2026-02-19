import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { StartingGridSelectUi } from './starting-grid-select.ui';
import { StartingMenuUi } from './starting-menu.ui';
import { StartingUi } from './starting.ui';

export class StartingPhase implements IGamePhase {
  private startingMenuUi: StartingMenuUi | null = null;
  private gridSelectUi: StartingGridSelectUi | null = null;
  private startingUi: StartingUi | null = null;

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    this.startingMenuUi = new StartingMenuUi(this.scene);
    this.gridSelectUi = new StartingGridSelectUi(this.scene, this.scene.getInputManager());
    this.startingUi = new StartingUi(this.scene, this.startingMenuUi, this.gridSelectUi);

    const isStarting = await this.startingUi.runStartingFlow();
    if (isStarting) {
      const pokemons = await this.scene.getApi().getStartingPokemons();
      if (pokemons) {
        this.startingUi.show();
        const selected = await this.startingUi.runStartingPokemonFlow(pokemons);
        if (selected) {
          const pokemon = await this.scene.getApi().pickStartingPokemon(selected.index);
          if (pokemon) {
            await this.startingUi.runCongratulationsFlow(selected.key);
            this.scene.getUser()!.getProfile()!.isNewbie = false;
            this.scene.popPhase();
          }
        }
      }
    }
  }

  exit(): void {
    this.startingMenuUi?.hide();
    this.startingMenuUi?.destroy();
    this.gridSelectUi?.hide();
    this.gridSelectUi?.destroy();
    this.startingUi?.hide();
    this.startingUi?.destroy();
  }

  update?(time: number, delta: number): void {}

  onPause?(): void {}

  onResume?(): void {}

  onRefreshLanguage?(): void {
    this.startingUi?.onRefreshLanguage();
  }
}
