import type { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, getPokemonTexture } from '@poposafari/utils';

export interface PokemonSlotData {
  pokedexId: string;
  level: number;
  isShiny: boolean;
  heldItemId: string | null;
}

export interface PokemonSlotOptions {
  iconScale?: number;
  showLevel?: boolean;
  levelOffsetY?: number;
  levelSize?: number;
  levelWeight?: number | string;
  heldItemScale?: number;
  heldItemOffset?: { x: number; y: number };
}

const DEFAULT_ICON_SCALE = 2;
const DEFAULT_HELD_ITEM_SCALE = 1;
const DEFAULT_LEVEL_SIZE = 40;
const DEFAULT_LEVEL_OFFSET_Y = 32;
const DEFAULT_LEVEL_WEIGHT: string = '150';

/** 포켓몬 아이콘 + 선택적 레벨 텍스트 + 소지 아이템 뱃지를 하나로 묶는 슬롯. */
export class PokemonSlotContainer extends Phaser.GameObjects.Container {
  scene: GameScene;
  private icon!: GImage;
  private level?: GText;
  private heldItem!: GImage;
  private iconScale = DEFAULT_ICON_SCALE;
  private heldItemScale = DEFAULT_HELD_ITEM_SCALE;

  constructor(scene: GameScene, x = 0, y = 0) {
    super(scene, x, y);
    this.scene = scene;
    this.setScrollFactor(0);
    scene.add.existing(this);
  }

  create(options: PokemonSlotOptions = {}): void {
    const {
      iconScale = DEFAULT_ICON_SCALE,
      showLevel = false,
      levelOffsetY = DEFAULT_LEVEL_OFFSET_Y,
      levelSize = DEFAULT_LEVEL_SIZE,
      levelWeight = DEFAULT_LEVEL_WEIGHT,
      heldItemScale = DEFAULT_HELD_ITEM_SCALE,
      heldItemOffset,
    } = options;

    this.iconScale = iconScale;
    this.heldItemScale = heldItemScale;

    const heldX = heldItemOffset?.x ?? 32 * iconScale - 16 * heldItemScale;
    const heldY = heldItemOffset?.y ?? 32 * iconScale - 16 * heldItemScale;

    this.icon = addImage(this.scene, TEXTURE.BLANK, undefined, 0, 0)
      .setScale(iconScale)
      .setVisible(false);
    this.add(this.icon);

    this.heldItem = addImage(this.scene, TEXTURE.BLANK, undefined, heldX, heldY)
      .setScale(heldItemScale)
      .setVisible(false);
    this.add(this.heldItem);

    if (showLevel) {
      this.level = addText(
        this.scene,
        0,
        levelOffsetY,
        '',
        levelSize,
        levelWeight,
        'center',
        TEXTSTYLE.YELLOW,
        TEXTSHADOW.GRAY,
      ).setVisible(false);
      this.add(this.level);
    }
  }

  setPokemon(pokemon: PokemonSlotData | null): void {
    if (!pokemon) {
      this.icon.setVisible(false);
      this.level?.setVisible(false);
      this.heldItem.setVisible(false);
      return;
    }

    const tex = getPokemonTexture('icon', String(pokemon.pokedexId), { isShiny: pokemon.isShiny });
    this.icon
      .setTexture(tex.key, tex.frame + '_0')
      .setScale(this.iconScale)
      .setVisible(true);

    this.level?.setText(`(+${pokemon.level})`).setVisible(true);

    const itemId = pokemon.heldItemId;
    if (itemId && this.scene.textures.exists(itemId)) {
      this.heldItem.setTexture(itemId).setScale(this.heldItemScale).setVisible(true);
    } else {
      this.heldItem.setVisible(false);
    }
  }

  /** 아이콘과 소지 아이템 뱃지를 동일한 알파로 페이드. */
  setIconAlpha(alpha: number): void {
    this.icon.setAlpha(alpha);
    this.heldItem.setAlpha(alpha);
  }
}
