import type { IGamePhase } from '@poposafari/core';
import i18next from '@poposafari/i18n';
import type { GameScene } from '@poposafari/scenes';
import type { PokemonHiddenMove } from '@poposafari/types';
import { getPokemonI18Name } from '@poposafari/utils';
import { HiddenMoveUi } from './hidden-move.ui';

export interface HiddenMoveCaster {
  pokedexId: string;
  isShiny?: boolean;
  isFemale?: boolean;
  nickname?: string | null;
}

export interface HiddenMoveContext {
  hiddenMove: PokemonHiddenMove;
  caster: HiddenMoveCaster;
  onComplete?: () => void;
}

export class HiddenMovePhase implements IGamePhase {
  private ui: HiddenMoveUi | null = null;

  constructor(
    private readonly scene: GameScene,
    private readonly ctx: HiddenMoveContext,
  ) {}

  enter(): void {
    void this.run();
  }

  exit(): void {
    this.ui?.hide();
    this.ui?.destroy();
    this.ui = null;
  }

  private async run(): Promise<void> {
    const displayName =
      this.ctx.caster.nickname ?? getPokemonI18Name(this.ctx.caster.pokedexId);
    const moveName = i18next.t(`pokemonHiddenMove:${this.ctx.hiddenMove}`);
    await this.scene
      .getMessage('talk')
      .showMessage(i18next.t('msg:usedHiddenMove', { name: displayName, move: moveName }));

    this.ui = new HiddenMoveUi(this.scene);
    await this.ui.play(this.ctx.caster);
    this.ctx.onComplete?.();
    this.scene.popPhase();
  }
}
