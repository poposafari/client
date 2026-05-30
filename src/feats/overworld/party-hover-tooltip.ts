import { ExpBarContainer } from '@poposafari/containers/exp-bar.container';
import { PartyListContainer } from '@poposafari/containers/party-list.container';
import { GameScene } from '@poposafari/scenes';
import {
  GrowthGroup,
  PokemonRank,
  TEXTCOLOR,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import {
  addContainer,
  addImage,
  addText,
  addWindow,
  getPokedexId,
  getPokemonI18Name,
  getPokemonTexture,
  updatePokemonGenderIcon,
} from '@poposafari/utils';
import i18next from 'i18next';

const RANK_WINDOW: Record<PokemonRank, TEXTURE> = {
  common: TEXTURE.WINDOW_COMMON,
  rare: TEXTURE.WINDOW_RARE,
  epic: TEXTURE.WINDOW_EPIC,
  legendary: TEXTURE.WINDOW_LEGENDARY,
};

const RANK_COLOR: Record<PokemonRank, string> = {
  common: TEXTCOLOR.COMMON,
  rare: TEXTCOLOR.RARE,
  epic: TEXTCOLOR.EPIC,
  legendary: TEXTCOLOR.LEGENDARY,
};

const RANK_LOCALE: Record<PokemonRank, string> = {
  common: 'etc:tierCommon',
  rare: 'etc:tierRare',
  epic: 'etc:tierEpic',
  legendary: 'etc:tierLegendary',
};

const BULLET = '·';

const LAYOUT = {
  windowWidth: 520,
  windowHeight: 700,
  windowScale: 4,
  nineSlice: { left: 8, right: 8, top: 8, bottom: 8 },
  paddingX: 28,
  paddingY: 24,

  centerX: 260,

  subtitleX: 500,
  subtitleY: 10,
  subtitleFontSize: 50,

  shinyIconX: 30,
  shinyIconY: 30,
  shinyIconScale: 2.4,

  spriteX: 260,
  spriteY: 150,
  spriteScale: 1.6,

  nameY: 290,
  nameFontSize: 60,

  genderX: 500,
  genderY: 60,
  genderFontSize: 80,

  // pokedexY: 155,
  // pokedexFontSize: 30,

  dividerColor: 0xffffff,
  dividerAlpha: 1,
  dividerHeight: 2,
  divider1Y: 330,
  divider2Y: 490,

  expRowY: 370,
  levelRowY: 410,
  friendshipRowY: 450,

  expBarWidth: 280,
  expBarHeight: 22,

  rowFontSize: 50,
  rowLabelX: 36,
  labelValueGap: 20,
  propRowsStartY: 530,
  rowGap: 40,

  cursorOffsetX: 50,
  cursorOffsetY: 5,
  edgeMargin: 16,
} as const;

const PROP_ROW_KEYS = ['etc:abilitySymbol', 'etc:heldItemSymbol', 'etc:natureSymbol'] as const;

type PartyMember = NonNullable<ReturnType<GameScene['getUser']>>['getParty'] extends () => infer R
  ? R extends Array<infer T>
    ? T
    : never
  : never;

export class PartyHoverTooltip {
  private scene: GameScene;
  private parent: GContainer;
  private partyList: PartyListContainer;

  private container!: GContainer;
  private window!: GWindow;
  private shinyIcon!: GImage;
  private pokemonNameText!: GText;
  private genderText!: GText;
  private subtitleText!: GText;
  private sprite!: GImage;
  // private pokedexText!: GText;
  private levelLabel!: GText;
  private levelText!: GText;
  private friendshipLabel!: GText;
  private friendshipText!: GText;
  private expLabel!: GText;
  private expBar!: ExpBarContainer;
  private propRowLabels: GText[] = [];
  private propRowValues: GText[] = [];

  private currentSlotIndex: number | null = null;
  private destroyed = false;

  constructor(scene: GameScene, parent: GContainer, partyList: PartyListContainer) {
    this.scene = scene;
    this.parent = parent;
    this.partyList = partyList;

    this.createTooltip();
    this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
  }

  private createTooltip(): void {
    this.container = addContainer(this.scene, 0, 0, 0);

    this.window = addWindow(
      this.scene,
      TEXTURE.WINDOW_COMMON,
      0,
      0,
      LAYOUT.windowWidth,
      LAYOUT.windowHeight,
      LAYOUT.windowScale,
      LAYOUT.nineSlice.left,
      LAYOUT.nineSlice.right,
      LAYOUT.nineSlice.top,
      LAYOUT.nineSlice.bottom,
    );
    this.window.setOrigin(0, 0);

    this.shinyIcon = addImage(
      this.scene,
      TEXTURE.ICON_SHINY,
      undefined,
      LAYOUT.shinyIconX,
      LAYOUT.shinyIconY,
    ).setScale(LAYOUT.shinyIconScale);

    this.pokemonNameText = addText(
      this.scene,
      LAYOUT.centerX,
      LAYOUT.nameY,
      '',
      LAYOUT.nameFontSize,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.genderText = addText(
      this.scene,
      LAYOUT.genderX,
      LAYOUT.genderY,
      '',
      LAYOUT.genderFontSize,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(1, 0);
    this.subtitleText = addText(
      this.scene,
      LAYOUT.subtitleX,
      LAYOUT.subtitleY,
      '',
      LAYOUT.subtitleFontSize,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    ).setOrigin(1, 0);

    this.sprite = addImage(this.scene, TEXTURE.BLANK, undefined, LAYOUT.spriteX, LAYOUT.spriteY);
    this.sprite.setScale(LAYOUT.spriteScale);

    // this.pokedexText = addText(
    //   this.scene,
    //   LAYOUT.rightInfoIconX,
    //   LAYOUT.pokedexY,
    //   '',
    //   LAYOUT.pokedexFontSize,
    //   '100',
    //   'left',
    //   TEXTSTYLE.WHITE,
    //   TEXTSHADOW.GRAY,
    // );

    this.levelLabel = addText(
      this.scene,
      LAYOUT.rowLabelX,
      LAYOUT.levelRowY,
      '',
      LAYOUT.rowFontSize,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.levelText = addText(
      this.scene,
      0,
      LAYOUT.levelRowY,
      '',
      LAYOUT.rowFontSize,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );

    this.friendshipLabel = addText(
      this.scene,
      LAYOUT.rowLabelX,
      LAYOUT.friendshipRowY,
      '',
      LAYOUT.rowFontSize,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.friendshipText = addText(
      this.scene,
      0,
      LAYOUT.friendshipRowY,
      '',
      LAYOUT.rowFontSize,
      '100',
      'left',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    );

    this.expLabel = addText(
      this.scene,
      LAYOUT.rowLabelX,
      LAYOUT.expRowY,
      '',
      LAYOUT.rowFontSize,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    const dividerWidth = LAYOUT.windowWidth - LAYOUT.paddingX * 2;
    const divider1 = this.scene.add
      .rectangle(
        LAYOUT.centerX,
        LAYOUT.divider1Y,
        dividerWidth,
        LAYOUT.dividerHeight,
        LAYOUT.dividerColor,
        LAYOUT.dividerAlpha,
      )
      .setScrollFactor(0);
    const divider2 = this.scene.add
      .rectangle(
        LAYOUT.centerX,
        LAYOUT.divider2Y,
        dividerWidth,
        LAYOUT.dividerHeight,
        LAYOUT.dividerColor,
        LAYOUT.dividerAlpha,
      )
      .setScrollFactor(0);

    this.expBar = new ExpBarContainer(this.scene, 0, LAYOUT.expRowY, {
      width: LAYOUT.expBarWidth,
      height: LAYOUT.expBarHeight,
    });

    this.container.add([
      this.window,
      this.shinyIcon,
      this.sprite,
      this.pokemonNameText,
      this.genderText,
      this.subtitleText,
      // this.pokedexText,
      this.levelLabel,
      this.levelText,
      this.friendshipLabel,
      this.friendshipText,
      this.expLabel,
      divider1,
      divider2,
      this.expBar,
    ]);

    this.createRows(
      PROP_ROW_KEYS.length,
      LAYOUT.propRowsStartY,
      this.propRowLabels,
      this.propRowValues,
    );

    this.container.setVisible(false);
    this.parent.add(this.container);
  }

  private createRows(count: number, startY: number, labels: GText[], values: GText[]): void {
    for (let i = 0; i < count; i++) {
      const y = startY + i * LAYOUT.rowGap;
      const label = addText(
        this.scene,
        LAYOUT.rowLabelX,
        y,
        '',
        LAYOUT.rowFontSize,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      );
      const value = addText(
        this.scene,
        0,
        y,
        '',
        LAYOUT.rowFontSize,
        '100',
        'left',
        TEXTSTYLE.YELLOW,
        TEXTSHADOW.GRAY,
      );
      labels.push(label);
      values.push(value);
      this.container.add([label, value]);
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.destroyed) return;
    if (!this.parent.visible || !this.partyList.visible) {
      if (this.currentSlotIndex !== null) {
        this.currentSlotIndex = null;
        this.hide();
      }
      return;
    }

    const hitIndex = this.findHoveredSlot(pointer);

    if (hitIndex !== this.currentSlotIndex) {
      this.currentSlotIndex = hitIndex;
      if (hitIndex !== null) {
        const pokemon = this.resolvePartyMember(hitIndex);
        if (pokemon) {
          this.populate(pokemon);
          this.updatePosition(pointer);
          this.parent.bringToTop(this.container);
          this.container.setVisible(true);
        } else {
          this.hide();
        }
      } else {
        this.hide();
      }
    } else if (hitIndex !== null) {
      this.updatePosition(pointer);
    }
  }

  private findHoveredSlot(pointer: Phaser.Input.Pointer): number | null {
    const slots = this.partyList.getSlots();
    for (let i = 0; i < slots.length; i++) {
      const icon = slots[i].getIcon();
      if (!icon.visible) continue;
      const bounds = icon.getBounds();
      if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
        return i;
      }
    }
    return null;
  }

  private resolvePartyMember(slotIndex: number): PartyMember | null {
    const party = this.scene.getUser()?.getParty() ?? [];
    const sorted = [...party].sort((a, b) => (a.partySlot ?? 0) - (b.partySlot ?? 0));
    return sorted[slotIndex] ?? null;
  }

  private populate(pokemon: PartyMember): void {
    const masterData = this.scene.getMasterData();
    const pokemonData = masterData.getPokemonData(pokemon.pokedexId);

    const rank: PokemonRank = pokemonData?.rank ?? 'common';
    const growthGroup: GrowthGroup = pokemonData?.growthGroup ?? 'medium_fast';

    this.window.setTexture(RANK_WINDOW[rank]);

    this.shinyIcon.setVisible(pokemon.isShiny);

    const rankColor = RANK_COLOR[rank];
    const displayName = pokemon.nickname ?? getPokemonI18Name(pokemon.pokedexId);
    this.pokemonNameText.setText(displayName).setStyle({ color: rankColor });
    updatePokemonGenderIcon(pokemon.gender, this.genderText);
    this.subtitleText.setText(`${i18next.t(RANK_LOCALE[rank])}`).setStyle({ color: rankColor });

    // this.pokedexText.setText(`No.${getPokedexId(pokemon.pokedexId)}`);

    const spriteTexture = getPokemonTexture(
      'sprite',
      pokemon.pokedexId,
      { isShiny: pokemon.isShiny, isFemale: pokemon.gender === 2 },
      this.scene,
    );
    this.sprite.setTexture(spriteTexture.key, spriteTexture.frame);

    const exp = pokemon.exp ?? 0;

    this.levelLabel.setText(`${BULLET} ${i18next.t('pc:level')}`);
    this.levelText.x = this.levelLabel.x + this.levelLabel.width + LAYOUT.labelValueGap;
    this.levelText.setText(`${pokemon.level}`);

    this.friendshipLabel.setText(`${BULLET} ${i18next.t('pc:friendship')}`);
    this.friendshipText.x =
      this.friendshipLabel.x + this.friendshipLabel.width + LAYOUT.labelValueGap;
    this.friendshipText.setText(`${pokemon.friendship ?? 0}`);

    this.expLabel.setText(`${BULLET} ${i18next.t('pc:exp')}`);
    this.expBar.x =
      this.expLabel.x + this.expLabel.width + LAYOUT.labelValueGap + LAYOUT.expBarWidth / 2;
    this.expBar.setProgress(pokemon.level, exp, growthGroup);

    const heldItemLabel = pokemon.heldItemId
      ? i18next.t(`item:${pokemon.heldItemId}.name`)
      : i18next.t('etc:noneSymbol');

    const propRowValues = [
      i18next.t(`ability:${pokemon.abilityId}`),
      heldItemLabel,
      i18next.t(`nature:${pokemon.natureId}`),
    ];
    for (let i = 0; i < PROP_ROW_KEYS.length; i++) {
      this.propRowLabels[i].setText(`${BULLET} ${i18next.t(PROP_ROW_KEYS[i])}`);
      this.propRowValues[i].x =
        this.propRowLabels[i].x + this.propRowLabels[i].width + LAYOUT.labelValueGap;
      this.propRowValues[i].setText(propRowValues[i]);
    }
  }

  private updatePosition(pointer: Phaser.Input.Pointer): void {
    const { width, height } = this.scene.cameras.main;
    const halfW = width / 2;
    const halfH = height / 2;

    const tooltipW = this.window.displayWidth;
    const tooltipH = this.window.displayHeight;

    let screenX = pointer.x - tooltipW - LAYOUT.cursorOffsetX;
    let screenY = pointer.y + LAYOUT.cursorOffsetY;

    if (screenX < LAYOUT.edgeMargin) screenX = LAYOUT.edgeMargin;
    if (screenX + tooltipW + LAYOUT.edgeMargin > width) {
      screenX = width - tooltipW - LAYOUT.edgeMargin;
    }

    const overflowBottom = screenY + tooltipH + LAYOUT.edgeMargin - height;
    if (overflowBottom > 0) {
      screenY -= overflowBottom;
    }
    if (screenY < LAYOUT.edgeMargin) screenY = LAYOUT.edgeMargin;

    this.container.setPosition(screenX - halfW, screenY - halfH);
  }

  private hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    this.destroyed = true;
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    this.currentSlotIndex = null;
    this.container.destroy();
  }
}
