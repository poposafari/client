import { BaseUi } from '@poposafari/core';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';
import { PokemonTypeContainer } from '@poposafari/containers/pokemon-type.container';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, PokedexEntry, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import {
  addBackground,
  addImage,
  addText,
  getPokemonI18Name,
  getPokemonTexture,
} from '@poposafari/utils';
import i18next from 'i18next';

const MASK_NAME = '----------';
const MASK_VALUE = '';

function baseId(id: string): string {
  return id.split(/[-_]/)[0].padStart(4, '0');
}

export class PokedexUi extends BaseUi {
  private bg!: GImage;

  private titleText!: GText;
  private titleIconLeft!: GImage;
  private titleIconRight!: GImage;

  private inputGuide!: KeyGuideBarContainer;

  private infoFront!: GImage;
  private infoDexNo!: GText;
  private infoName!: GText;
  private infoSpecies!: GText;
  private infoType1!: PokemonTypeContainer;
  private infoType2!: PokemonTypeContainer;
  private infoHeightSymbol!: GText;
  private infoHeight!: GText;
  private infoWeightSymbol!: GText;
  private infoWeight!: GText;
  private infoCaughtCountSymbol!: GText;
  private infoCaughtCount!: GText;
  private infoDescription!: GText;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.createLayout();
  }

  createLayout(): void {
    const scene = this.scene as GameScene;
    this.bg = addBackground(scene, TEXTURE.BG_POKEDEX);
    this.add(this.bg);
    this.createTitleLayout();
    this.createInfoLayout();
    this.createInputGuide();
  }

  private createInputGuide(): void {
    this.inputGuide = new KeyGuideBarContainer(this.scene as GameScene);
    this.inputGuide.create({
      entries: [
        { keys: [i18next.t('etc:arrowKey')], description: i18next.t('etc:move') },
        { keys: ['X', 'ESC'], description: i18next.t('etc:cancel') },
      ],
      keycapTextSize: 40,
      keycapPaddingX: 50,
      keycapPaddingY: 40,
      keycapScale: 2,
      keycapTextYOffset: -5,
      descriptionTextSize: 50,
      descriptionTextStyle: TEXTSTYLE.WHITE,
      descriptionTextShadow: TEXTSHADOW.GRAY,
      gapKeyToDescription: 5,
      gapBetweenEntries: 25,
      gapInsideEntry: 4,
      align: 'left',
      maxWidth: this.scene.cameras.main.width - 60,
    });
    this.inputGuide.setPosition(-915, -490);
    this.add(this.inputGuide);
  }

  private createTitleLayout(): void {
    const scene = this.scene as GameScene;
    const titleY = -495;
    const iconGap = 60;

    this.titleText = addText(
      scene,
      0,
      titleY,
      i18next.t('etc:pokedex'),
      80,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.titleText.setOrigin(0.5, 0.5);

    const halfW = this.titleText.displayWidth / 2;
    this.titleIconLeft = addImage(
      scene,
      TEXTURE.ICON_POKEDEX,
      undefined,
      -halfW - iconGap,
      titleY,
    ).setScale(3);
    this.titleIconRight = addImage(
      scene,
      TEXTURE.ICON_POKEDEX,
      undefined,
      halfW + iconGap,
      titleY,
    ).setScale(3);

    this.add([this.titleIconLeft, this.titleText, this.titleIconRight]);
  }

  private createInfoLayout(): void {
    const scene = this.scene as GameScene;

    this.infoDexNo = addText(
      scene,
      -930,
      +100,
      'No. 0000',
      70,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
    ).setStroke('#808080', 10);

    this.infoFront = addImage(scene, 'pokemon.front', '0001', -450, -80).setScale(2.7);

    this.infoName = addText(
      scene,
      -460,
      -370,
      '',
      90,
      '100',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoSpecies = addText(
      scene,
      -930,
      +160,
      '',
      65,
      '100',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.NONE,
    ).setStroke('#808080', 10);

    this.infoType1 = new PokemonTypeContainer(scene, -870, +225);
    this.infoType2 = new PokemonTypeContainer(scene, -730, +225);

    this.infoHeightSymbol = addText(
      scene,
      -320,
      +155,
      '',
      60,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoHeight = addText(
      scene,
      -300,
      +155,
      '',
      60,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoWeightSymbol = addText(
      scene,
      -320,
      +213,
      '',
      60,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoWeight = addText(
      scene,
      -300,
      +213,
      '',
      60,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoCaughtCountSymbol = addText(
      scene,
      -900,
      -260,
      '',
      70,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoCaughtCount = addText(
      scene,
      -900,
      -260,
      '',
      70,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );

    this.infoDescription = addText(
      scene,
      -880,
      +290,
      '',
      65,
      '100',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoDescription.setOrigin(0, 0);
    this.infoDescription.setWordWrapWidth(900);

    this.add([
      this.infoDexNo,
      this.infoFront,
      this.infoName,
      this.infoSpecies,
      this.infoType1,
      this.infoType2,
      this.infoHeightSymbol,
      this.infoHeight,
      this.infoWeightSymbol,
      this.infoWeight,
      this.infoCaughtCountSymbol,
      this.infoCaughtCount,
      this.infoDescription,
    ]);

    this.setSymbols();
  }

  private setSymbols(): void {
    this.infoHeightSymbol.setText(i18next.t('etc:height'));
    this.infoWeightSymbol.setText(i18next.t('etc:weight'));
    this.infoCaughtCountSymbol.setText(i18next.t('etc:caughtCount'));

    const maxWidth = Math.max(
      this.infoHeightSymbol.displayWidth,
      this.infoWeightSymbol.displayWidth,
    );
    const valueX = this.infoHeightSymbol.x + maxWidth + 45;
    this.infoHeight.setX(valueX);
    this.infoWeight.setX(valueX);

    this.infoCaughtCount.setX(
      this.infoCaughtCountSymbol.x + this.infoCaughtCountSymbol.displayWidth + 30,
    );
  }

  updateInfo(pokedexKey: string): void {
    const scene = this.scene as GameScene;
    const masterData = scene.getMasterData();
    const user = scene.getUser();
    const pokedex: PokedexEntry[] = user?.getPokedex() ?? [];

    const base = baseId(pokedexKey);
    const hasVariant = pokedexKey !== base;

    const caughtKeySet = new Set(pokedex.filter((p) => p.caughtCount > 0).map((p) => p.pokedexId));
    const caughtBaseSet = new Set(
      pokedex.filter((p) => p.caughtCount > 0).map((p) => baseId(p.pokedexId)),
    );
    const isSeen = hasVariant ? caughtKeySet.has(pokedexKey) : caughtBaseSet.has(base);

    const data = masterData.getPokemonData(pokedexKey) ?? masterData.getPokemonData(base);
    const caughtCount = pokedex.find((p) => p.pokedexId === pokedexKey)?.caughtCount ?? 0;

    this.infoDexNo.setText(`No. ${base}`);

    const tex = getPokemonTexture('sprite', pokedexKey);
    this.infoFront.setTexture(tex.key, tex.frame);
    this.infoFront.setVisible(true);

    if (isSeen) {
      this.infoFront.clearTint();
      this.infoName.setText(getPokemonI18Name(pokedexKey));

      const speciesBase = i18next.t(`pokemon:${base}.species`, { defaultValue: '' });
      const speciesVar = hasVariant
        ? i18next.t(`pokemon:${pokedexKey}.species`, { defaultValue: speciesBase })
        : speciesBase;
      this.infoSpecies.setText(speciesVar);

      const descBase = i18next.t(`pokemon:${base}.description`, { defaultValue: '' });
      const descVar = hasVariant
        ? i18next.t(`pokemon:${pokedexKey}.description`, { defaultValue: descBase })
        : descBase;
      this.infoDescription.setText(descVar);

      if (data) {
        this.infoType1.setType(data.type1);
        if (data.type2) this.infoType2.setType(data.type2);
        else this.infoType2.clear();
        this.infoHeight.setText(`${data.height_m}m`);
        this.infoWeight.setText(`${data.weight_kg}kg`);
      } else {
        this.infoType1.clear();
        this.infoType2.clear();
        this.infoHeight.setText('');
        this.infoWeight.setText('');
      }
    } else {
      this.infoDexNo.setText('');
      this.infoFront.setTint(0x000000);
      this.infoName.setText(MASK_NAME);
      this.infoSpecies.setText(MASK_VALUE);
      this.infoDescription.setText('');
      this.infoType1.clear();
      this.infoType2.clear();
      this.infoHeight.setText(MASK_VALUE);
      this.infoWeight.setText(MASK_VALUE);
    }

    this.infoCaughtCount.setText(`${caughtCount}`);
  }

  onInput(_key: string): void {}

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<never> {
    return new Promise(() => {});
  }
}
