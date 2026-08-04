import { BaseUi } from '@poposafari/core';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';
import { GameScene } from '@poposafari/scenes';
import { DEPTH, GameAction, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import {
  addBackground,
  addImage,
  addText,
  getPokedexBaseId,
  getPokemonI18Name,
  getPokemonTexture,
} from '@poposafari/utils';
import i18next from 'i18next';
import { buildCaughtSets, isPokedexSeen } from './pokedex.util';

const MASK_NAME = '----------';

export class PokedexUi extends BaseUi {
  private bg!: GImage;

  private titleText!: GText;
  private titleIconLeft!: GImage;
  private titleIconRight!: GImage;

  private inputGuide!: KeyGuideBarContainer;

  private infoFront!: GImage;
  private infoName!: GText;
  private infoCaughtCountSymbol!: GText;
  private infoCaughtCount!: GText;

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
        { actions: [GameAction.CONFIRM], description: i18next.t('etc:pokedexDetail') },
        { actions: [GameAction.CANCEL], description: i18next.t('etc:cancel') },
      ],
      keycapTextSize: 40,
      keycapPaddingX: 50,
      keycapPaddingY: 40,
      keycapScale: 2,
      keycapTextYOffset: -5,
      descriptionTextSize: 50,
      descriptionTextStyle: TEXTSTYLE.BLACK,
      descriptionTextShadow: TEXTSHADOW.GRAY,
      gapKeyToDescription: 5,
      gapBetweenEntries: 25,
      gapInsideEntry: 4,
      align: 'left',
      maxWidth: this.scene.cameras.main.width - 60,
    });
    this.inputGuide.setPosition(-940, +495);
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

    this.infoFront = addImage(scene, 'pokemon.front', '0001', -450, +80).setScale(3.4);

    this.infoName = addText(
      scene,
      -460,
      -368,
      '',
      100,
      'bold',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    );
    this.infoName.setOrigin(0.5, 0.5);

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

    this.add([this.infoFront, this.infoName, this.infoCaughtCountSymbol, this.infoCaughtCount]);

    this.setSymbols();
  }

  private setSymbols(): void {
    this.infoCaughtCountSymbol.setText(i18next.t('etc:caughtCount'));
    this.infoCaughtCount.setX(
      this.infoCaughtCountSymbol.x + this.infoCaughtCountSymbol.displayWidth + 30,
    );
  }

  updateInfo(pokedexKey: string): void {
    const scene = this.scene as GameScene;
    const pokedex = scene.getUser()?.getPokedex() ?? [];

    const base = getPokedexBaseId(pokedexKey);
    const isSeen = isPokedexSeen(pokedexKey, buildCaughtSets(pokedex));
    const caughtCount = pokedex.find((p) => p.pokedexId === pokedexKey)?.caughtCount ?? 0;

    const tex = getPokemonTexture('sprite', pokedexKey);
    this.infoFront.setTexture(tex.key, tex.frame);
    this.infoFront.setVisible(true);

    if (isSeen) {
      this.infoFront.clearTint();
      this.infoName.setText(getPokemonI18Name(pokedexKey));
    } else {
      this.infoFront.setTint(0x000000);
      this.infoName.setText(MASK_NAME);
    }

    this.infoCaughtCount.setText(`${caughtCount}`);
  }

  onInput(_key: string): void {}

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<never> {
    return new Promise(() => {});
  }
}
