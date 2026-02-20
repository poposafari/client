import { InputManager } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import type { StartingPokemon } from '@poposafari/types';
import { TEXTURE } from '@poposafari/types';
import { addImage, addSprite, getPokemonTexture } from '@poposafari/utils';
import { GridSelectUi, IGridSelectConfig, IGridSelectItem } from '../grid/grid-select.ui';

const POKEMON_ICON_ANIM_PREFIX = 'pokemon.icon.';

function buildItemsFromPokemons(
  scene: GameScene,
  pokemons: StartingPokemon[],
  iconAnimKeyByKey: Map<string, string>,
): IGridSelectItem[] {
  return pokemons.map((p) => {
    const key = p.form ? `${p.pokemonId}_${p.region}` : p.pokemonId;
    const textureKey = getPokemonTexture('icon', key, { isShiny: p.shiny });
    iconAnimKeyByKey.set(key, POKEMON_ICON_ANIM_PREFIX + textureKey.frame);

    return {
      key,
      label: p.comment || key,
      image: addSprite(scene, textureKey.key, textureKey.frame + '_0', 0, 0),
    };
  });
}

export class StartingGridSelectUi extends GridSelectUi {
  private iconAnimKeyByKey = new Map<string, string>();

  constructor(scene: GameScene, inputManager: InputManager) {
    const config: IGridSelectConfig = {
      x: scene.scale.width / 2,
      y: scene.scale.height / 2 - 80,
      outerWindowTexture: TEXTURE.BLANK,
      innerWindowTexture: TEXTURE.BLANK,
      cursorTexture: TEXTURE.BLANK,
      cursorWindowTexture: TEXTURE.WINDOW_CURSOR,
      itemScale: 2.2,
      items: [],
      columns: 9,
      rows: 4,
      rowGap: 60,
      columnGap: 60,
      cursorWindowSize: 120,
      cursorWindowScale: 2.4,
    };

    super(scene, inputManager, config);
  }

  setPokemonItems(pokemons: StartingPokemon[]): void {
    const scene = this.scene as GameScene;
    this.iconAnimKeyByKey.clear();
    this.setItems(buildItemsFromPokemons(scene, pokemons, this.iconAnimKeyByKey));
  }

  getIconAnimationKey(key: string): string | undefined {
    return this.iconAnimKeyByKey.get(key);
  }
}
