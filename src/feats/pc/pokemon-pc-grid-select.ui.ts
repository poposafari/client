import { InputManager } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import type { PokemonBoxItem } from '@poposafari/types';
import { SFX, TEXTURE } from '@poposafari/types';
import { addImage, addSprite, getPokedexId, getPokemonTexture } from '@poposafari/utils';
import { GridSelectUi, IGridSelectConfig, IGridSelectItem } from '../grid/grid-select.ui';

const POKEMON_ICON_ANIM_PREFIX = 'pokemon.icon.';
const GRID_SLOT_COUNT = 30;
const EMPTY_SLOT_KEY_PREFIX = '__empty_';
const HELD_ITEM_SCALE = 2.4;
const HELD_ITEM_OFFSET_X = 30;
const HELD_ITEM_OFFSET_Y = 50;

function pokedexIdToKey(pokedexId: string): string {
  return getPokedexId(pokedexId);
}

function buildGridSlots(
  scene: GameScene,
  pokemons: PokemonBoxItem[],
  iconAnimKeyByKey: Map<string, string>,
): IGridSelectItem[] {
  const byGrid = new Map<number, PokemonBoxItem>();
  for (const p of pokemons) {
    if (p.gridNumber !== null && p.gridNumber !== undefined) {
      byGrid.set(p.gridNumber, p);
    }
  }

  const slots: IGridSelectItem[] = [];
  for (let i = 0; i < GRID_SLOT_COUNT; i++) {
    const pokemon = byGrid.get(i);
    if (pokemon) {
      const key = pokemon.pokedexId;
      const textureKey = getPokemonTexture('icon', key, { isShiny: pokemon.isShiny });
      iconAnimKeyByKey.set(String(pokemon.id), POKEMON_ICON_ANIM_PREFIX + textureKey.frame);
      const heldItemId = pokemon.heldItemId;
      const hasHeldItem = !!heldItemId && scene.textures.exists(heldItemId);
      const overlayImage = hasHeldItem
        ? addImage(scene, heldItemId as string, undefined, 0, 0).setScale(HELD_ITEM_SCALE)
        : undefined;
      slots.push({
        key: String(pokemon.id),
        label: pokemon.nickname ?? key,
        image: addSprite(scene, textureKey.key, textureKey.frame + '_0', 0, 0),
        overlayImage,
        overlayOffsetX: overlayImage ? HELD_ITEM_OFFSET_X : undefined,
        overlayOffsetY: overlayImage ? HELD_ITEM_OFFSET_Y : undefined,
      });
    } else {
      slots.push({
        key: EMPTY_SLOT_KEY_PREFIX + i,
        label: '',
        image: addImage(scene, TEXTURE.BLANK, undefined, 0, 0).setAlpha(0),
      });
    }
  }
  return slots;
}

export class PokemonPcGridSelectUi extends GridSelectUi {
  private iconAnimKeyByKey = new Map<string, string>();

  onExitTop?: () => void;
  onExitRight?: () => void;

  constructor(scene: GameScene, inputManager: InputManager) {
    const config: IGridSelectConfig = {
      x: +340,
      y: -5,
      outerWindowTexture: TEXTURE.BLANK,
      innerWindowTexture: TEXTURE.BLANK,
      cursor: {
        type: 'sprite',
        texture: TEXTURE.PC_FINGER_0,
        frame: 'pc_finger_0-0',
        scale: 4,
        offsetX: 0,
        offsetY: -50,
      },
      itemScale: 3,
      items: [],
      columns: 6,
      rows: 5,
      rowGap: 60,
      columnGap: 70,
    };

    super(scene, inputManager, config);

    const animKey = 'pc_finger_0_anim';
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNames(TEXTURE.PC_FINGER_0, {
          prefix: 'pc_finger_0-',
          start: 0,
          end: 1,
        }),
        duration: 500,
        repeat: -1,
      });
    }
    (this.cursor as GSprite).play(animKey);
  }

  setPokemonItems(pokemons: PokemonBoxItem[]): void {
    const scene = this.scene as GameScene;
    this.iconAnimKeyByKey.clear();
    this.setItems(buildGridSlots(scene, pokemons, this.iconAnimKeyByKey));
  }

  isEmptySlot(index: number): boolean {
    const items = this.getItems();
    return index >= 0 && index < items.length && items[index].key.startsWith(EMPTY_SLOT_KEY_PREFIX);
  }

  setCursorToIndex(index: number): void {
    const items = this.getItems();
    if (index >= 0 && index < items.length) {
      this.cursorIndex = index;
      this.updateCursorPosition();
    }
  }

  getIconAnimationKey(key: string): string | undefined {
    return this.iconAnimKeyByKey.get(key);
  }

  applyAlphaFilter(eligibleKeys: Set<string>): void {
    const items = this.getItems();
    for (const it of items) {
      if (it.key.startsWith(EMPTY_SLOT_KEY_PREFIX)) continue;
      const alpha = eligibleKeys.has(it.key) ? 1 : 0.3;
      it.image.setAlpha(alpha);
      it.overlayImage?.setAlpha(alpha);
    }
  }

  clearAlphaFilter(): void {
    const items = this.getItems();
    for (const it of items) {
      if (it.key.startsWith(EMPTY_SLOT_KEY_PREFIX)) continue;
      it.image.setAlpha(1);
      it.overlayImage?.setAlpha(1);
    }
  }

  protected handleDirectionInput(key: string): boolean {
    const dir = this.getDirectionKeys();
    const cols = this.config.columns;
    const items = this.getItems();
    if (items.length === 0) return false;

    // 첫 번째 행 + UP → 상단 UI로 탈출
    if (key === dir.up && this.cursorIndex < cols) {
      (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
      this.onExitTop?.();
      return true;
    }

    if (key === dir.right && this.cursorIndex % cols === cols - 1) {
      (this.scene as GameScene).getAudio().playEffect(SFX.CURSOR_0);
      this.onExitRight?.();
      return true;
    }

    return false;
  }
}
