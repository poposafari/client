import type { GameScene } from '@poposafari/scenes';
import { TEXTFONT, TEXTSHADOW, TEXTSTROKE, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, getPokemonTexture } from '@poposafari/utils';
import { partyMemberCaptureBonus } from '@poposafari/core/party-bonus';

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
  levelIconScale?: number;
  levelIconGap?: number;
  heldItemScale?: number;
  heldItemOffset?: { x: number; y: number };
  showPartyBonus?: boolean;
  partyBonusOffsetX?: number;
  partyBonusOffsetY?: number;
  partyBonusSize?: number;
}

const DEFAULT_ICON_SCALE = 2;
const DEFAULT_HELD_ITEM_SCALE = 1;
const DEFAULT_LEVEL_SIZE = 40;
const DEFAULT_LEVEL_OFFSET_Y = 32;
const DEFAULT_LEVEL_WEIGHT: string = '150';
const DEFAULT_LEVEL_ICON_GAP = 4;

/** 포켓몬 아이콘 + 선택적 레벨 텍스트 + 소지 아이템 뱃지를 하나로 묶는 슬롯. */
export class PokemonSlotContainer extends Phaser.GameObjects.Container {
  scene: GameScene;
  private icon!: GImage;
  private level?: GText;
  private levelIcon?: GImage;
  private levelIconGap = DEFAULT_LEVEL_ICON_GAP;
  private partyBonusText?: GText;
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
      levelIconScale = levelSize / 25,
      levelIconGap = DEFAULT_LEVEL_ICON_GAP,
      heldItemScale = DEFAULT_HELD_ITEM_SCALE,
      heldItemOffset,
      showPartyBonus = false,
      partyBonusSize = Math.round(levelSize * 0.8),
      partyBonusOffsetX = 0,
      partyBonusOffsetY = levelOffsetY - levelSize,
    } = options;

    this.iconScale = iconScale;
    this.heldItemScale = heldItemScale;
    this.levelIconGap = levelIconGap;

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
      this.levelIcon = addImage(this.scene, TEXTURE.ICON_LV, undefined, 0, levelOffsetY)
        .setScale(levelIconScale)
        .setVisible(false);
      this.add(this.levelIcon);

      this.level = addText(
        this.scene,
        0,
        levelOffsetY - 5,
        '',
        levelSize,
        levelWeight,
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      )
        .setOrigin(0, 0.5)
        .setVisible(false);
      this.add(this.level);
    }

    if (showPartyBonus) {
      this.partyBonusText = addText(
        this.scene,
        partyBonusOffsetX,
        partyBonusOffsetY,
        '',
        partyBonusSize,
        levelWeight,
        'center',
        TEXTSTYLE.SIG_0,
        TEXTSHADOW.NONE,
        TEXTSTROKE.GRAY,
      )
        .setOrigin(0.5, 0.5)
        .setVisible(false)
        .setFontFamily(TEXTFONT.MN);
      this.add(this.partyBonusText);
    }
  }

  setPokemon(pokemon: PokemonSlotData | null): void {
    if (!pokemon) {
      this.icon.setVisible(false);
      this.level?.setVisible(false);
      this.levelIcon?.setVisible(false);
      this.heldItem.setVisible(false);
      this.partyBonusText?.setVisible(false);
      return;
    }

    const tex = getPokemonTexture('icon', String(pokemon.pokedexId), { isShiny: pokemon.isShiny });
    this.icon
      .setTexture(tex.key, tex.frame + '_0')
      .setScale(this.iconScale)
      .setVisible(true);

    if (this.level && this.levelIcon) {
      this.level.setText(`${pokemon.level}`);
      const iconW = this.levelIcon.displayWidth;
      const textW = this.level.displayWidth;
      const totalW = iconW + this.levelIconGap + textW;
      const leftEdge = -totalW / 2;
      this.levelIcon.setX(leftEdge + iconW / 2).setVisible(true);
      this.level.setX(leftEdge + iconW + this.levelIconGap).setVisible(true);
    }

    if (this.partyBonusText) {
      const master = this.scene.getMasterData().getPokemonData(String(pokemon.pokedexId));
      const rank = master?.rank ?? 'common';
      const bonus = partyMemberCaptureBonus(pokemon.level, pokemon.isShiny, rank);
      this.partyBonusText.setText(`+${(bonus * 100).toFixed(1)}%`).setVisible(true);
    }

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

  /** hover hit-test용 아이콘 이미지. 비어있는 슬롯에서는 visible=false. */
  getIcon(): GImage {
    return this.icon;
  }
}
