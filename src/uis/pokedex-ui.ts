import { ANIMATION, AUDIO, DEPTH, TEXTSTYLE, TEXTURE, TYPE, UI } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { ListForm } from '../types';
import { getPokemonTextureFromPokedex, getPokemonType } from '../utils/string-util';
import { MenuListUi } from './menu-list-ui';
import { clickCursorEffect, playEffectSound, runFadeEffect, Ui } from './ui';
import { getAllPokemonKeys, getPokemonData, getPokemonKeysByGen } from '../data';
import i18next from 'i18next';
import { Game } from '../core/manager/game-manager';
import { Pokedex } from '../core/storage/player-pokedex';
import { NOT_POKEDEX_NAME, SYMBOL_HEIGHT, SYMBOL_WEIGHT } from '../constants';

export class PokedexUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private list!: MenuListUi;
  private infoUi!: PokedexInfoUi;
  private readonly scale: number = 2;

  private listTitle!: Phaser.GameObjects.Text;
  private cursorLeft!: Phaser.GameObjects.Sprite;
  private cursorRight!: Phaser.GameObjects.Sprite;

  private readonly windowTitleWidth: number = 400 / this.scale;
  private readonly windowTitleHeight: number = 63 / this.scale;

  private currentPage: number = 0;

  private readonly listWindowWidth: number = 400 / this.scale;
  private readonly listWindowHeight: number = 415 / this.scale;
  private readonly listTitles: string[] = [
    i18next.t('menu:gen_all'),
    i18next.t('menu:gen_1'),
    i18next.t('menu:gen_2'),
    i18next.t('menu:gen_3'),
    i18next.t('menu:gen_4'),
    i18next.t('menu:gen_5'),
    i18next.t('menu:gen_6'),
    i18next.t('menu:gen_7'),
    i18next.t('menu:gen_8'),
    i18next.t('menu:gen_9'),
  ];

  constructor(scene: InGameScene) {
    super(scene);
    this.infoUi = new PokedexInfoUi(this.scene);
    this.list = new MenuListUi(this.scene, this.infoUi);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.infoUi.setup();

    this.list.setup({
      scale: 2.2,
      etcScale: 2.2,
      windowWidth: 368,
      offsetX: +80,
      offsetY: +420,
      depth: DEPTH.MENU + 1,
      per: 9,
      info: [],
      window: TEXTURE.BLANK,
      cursor: TEXTURE.WINDOW_RED_1,
      isAllowLRCancel: true,
    });

    this.container = this.createTrackedContainer(width / 2, height / 2);

    const bg = this.addBackground(TEXTURE.BG_POKEDEX).setOrigin(0.5, 0.5);
    const overlay_0 = this.addImage(TEXTURE.POKEDEX_OVERLAY_0, 0, -250).setOrigin(0.5, 0.5);
    const listWindow = this.addWindow(TEXTURE.POKEDEX_LIST, +275, +58, this.listWindowWidth, this.listWindowHeight, 16, 16, 16, 16).setScale(this.scale);
    const windowTitle = this.addWindow(TEXTURE.POKEDEX_WINDOW, +275, -185, this.windowTitleWidth, this.windowTitleHeight, 16, 16, 16, 16).setScale(this.scale);
    this.listTitle = this.addText(275, -185, this.listTitles[this.currentPage], TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.5);
    overlay_0.setDisplaySize(width, 55);
    this.cursorLeft = this.createSprite(TEXTURE.CURSOR_0, +100, -205).setScale(1.4);
    this.cursorRight = this.createSprite(TEXTURE.CURSOR_0, +390, -205).setScale(1.4).setFlipX(true);

    this.container.add(bg);
    this.container.add(overlay_0);
    this.container.add(windowTitle);
    this.container.add(listWindow);
    this.container.add(this.listTitle);
    this.container.add(this.cursorLeft);
    this.container.add(this.cursorRight);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    runFadeEffect(this.scene, 800, 'in');

    this.cursorLeft.play({ key: ANIMATION.CURSOR_0, repeat: -1, frameRate: 15 });
    this.cursorRight.play({ key: ANIMATION.CURSOR_0, repeat: -1, frameRate: 15 });

    this.container.setVisible(true);
    this.infoUi.show();

    await this.handleKeyInput();
  }

  protected onClean(): void {
    runFadeEffect(this.scene, 800, 'in');

    if (this.container) {
      this.container.setVisible(false);
    }

    if (this.list) {
      this.list.clean();
      this.infoUi.clean();
    }
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(...data: any[]): Promise<void> {
    this.list.updateInfo(this.createListForm(this.currentPage));

    while (true) {
      const selectedItemIndex = await this.list.handleKeyInput();
      if (typeof selectedItemIndex !== 'number' || selectedItemIndex < 0) {
        if (typeof selectedItemIndex === 'string' && selectedItemIndex === 'cancelL') {
          playEffectSound(this.scene, AUDIO.SELECT_0);
          clickCursorEffect(this.scene, this.cursorLeft);
          this.currentPage = this.currentPage > 0 ? this.currentPage - 1 : this.listTitles.length - 1;
          this.updateList(this.currentPage);
          this.listTitle.setText(this.listTitles[this.currentPage]);
          continue;
        } else if (typeof selectedItemIndex === 'string' && selectedItemIndex === 'cancelR') {
          playEffectSound(this.scene, AUDIO.SELECT_0);
          clickCursorEffect(this.scene, this.cursorRight);
          this.currentPage = this.currentPage < this.listTitles.length - 1 ? this.currentPage + 1 : 0;
          this.updateList(this.currentPage);
          this.listTitle.setText(this.listTitles[this.currentPage]);
          continue;
        } else if (typeof selectedItemIndex === 'string' && selectedItemIndex === i18next.t('menu:cancelMenu')) {
          await Game.removeUi(UI.POKEDEX);
          return;
        }
      }
    }
  }

  update(time?: number, delta?: number): void {}

  updateList(page: number) {
    this.currentPage = page;
    this.list.updateInfo(this.createListForm(page));
  }

  private createListForm(page: number): ListForm[] {
    let gen: 'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' = 'all';

    if (page !== 0) gen = page.toString() as '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

    const ret: ListForm[] = [];
    let listName = '';
    let listIcon = TEXTURE.BLANK;

    this.infoUi.updatePokedexs(this.getFilteredPokemonKeys(gen));

    for (const key of this.getFilteredPokemonKeys(gen)) {
      let split = key.split('_');
      const isGen = Pokedex.matchGen(key);
      let pokedex = split[0];
      let region = '';

      if ((isGen && key.includes('alola')) || key.includes('galar') || key.includes('paldea') || key.includes('hisui') || key.includes('west') || key.includes('east')) {
        region = i18next.t(`menu:${split[1]}`) + ' ';
      }

      listName = isGen ? `    ${pokedex} ` + region + i18next.t(`pokemon:${pokedex}.name`) : NOT_POKEDEX_NAME;
      listIcon = isGen ? TEXTURE.ICON_FOLLOW : TEXTURE.BLANK;
      ret.push({
        name: listName,
        nameImg: listIcon,
        etc: ``,
        etcImg: ``,
      });
    }

    return ret;
  }

  private getFilteredPokemonKeys(gen: 'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'): string[] {
    const allKeys = getPokemonKeysByGen(gen);
    const filteredKeys: string[] = [];

    for (const key of allKeys) {
      if (/^\d{4}$/.test(key)) {
        filteredKeys.push(key);
        continue;
      }

      const match = key.match(/^(\d{4})_(.+)$/);
      if (!match) {
        continue;
      }

      const suffix = match[2];

      if (['hisui', 'alola', 'galar', 'paldea', 'west', 'east'].includes(suffix)) {
        filteredKeys.push(key);
        continue;
      }

      if (/^[a-z]$/.test(suffix)) {
        filteredKeys.push(key);
        continue;
      }

      if (/^[0-9a-f]{1,2}$/.test(suffix)) {
        filteredKeys.push(key);
        continue;
      }
    }

    filteredKeys.sort((a, b) => {
      const aMatch = a.match(/^(\d{4})(?:_(.+))?$/);
      const bMatch = b.match(/^(\d{4})(?:_(.+))?$/);

      if (!aMatch || !bMatch) {
        return a.localeCompare(b);
      }

      const aNum = parseInt(aMatch[1], 10);
      const bNum = parseInt(bMatch[1], 10);

      if (aNum !== bNum) {
        return aNum - bNum;
      }

      const aSuffix = aMatch[2];
      const bSuffix = bMatch[2];

      if (!aSuffix && !bSuffix) {
        return 0;
      }

      if (!aSuffix) {
        return -1;
      }

      if (!bSuffix) {
        return 1;
      }

      return aSuffix.localeCompare(bSuffix);
    });

    return filteredKeys;
  }
}

export class PokedexInfoUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private pokemonFront!: Phaser.GameObjects.Image;
  private pokemonDesc!: Phaser.GameObjects.Text;
  private pokemonName!: Phaser.GameObjects.Text;
  private pokemonSpecies!: Phaser.GameObjects.Text;
  private pokemonHeight!: Phaser.GameObjects.Text;
  private pokemonWeight!: Phaser.GameObjects.Text;
  private type1!: Phaser.GameObjects.Image;
  private type2!: Phaser.GameObjects.Image;
  private pokemonGender!: Phaser.GameObjects.Text;

  private pokedexs: string[] = [];

  private readonly scale: number = 2;

  private readonly windowNameWidth: number = 300 / this.scale;
  private readonly windowNameHeight: number = 50 / this.scale;
  private readonly windowDescWidth: number = 475 / this.scale;
  private readonly windowDescHeight: number = 110 / this.scale;
  private readonly windowWeightAndHeightWidth: number = 200 / this.scale;
  private readonly windowWeightAndHeightHeight: number = 80 / this.scale;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createTrackedContainer(width / 2, height / 2);

    this.pokemonFront = this.addImage(getPokemonTextureFromPokedex('front', '0384', null), -238, -40).setScale(1.3);
    this.pokemonHeight = this.addText(-340, +95, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.35);
    this.pokemonWeight = this.addText(-340, +125, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.35);
    this.pokemonDesc = this.addText(-238, +210, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.4);
    this.pokemonDesc.setAlign('center');
    this.pokemonName = this.addText(-238, -180, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5).setScale(0.5);
    this.pokemonSpecies = this.addText(-475, +15, '', TEXTSTYLE.ONLY_WHITE).setOrigin(0, 0.5).setScale(0.4);
    this.pokemonSpecies.setStroke('#696969', 12);

    const windowDesc = this.addWindow(TEXTURE.POKEDEX_WINDOW, -238, +210, this.windowDescWidth, this.windowDescHeight, 16, 16, 16, 16).setScale(this.scale);
    const windowName = this.addWindow(TEXTURE.POKEDEX_WINDOW, -238, -180, this.windowNameWidth, this.windowNameHeight, 16, 16, 16, 16).setScale(this.scale);
    const windowWeightAndHeight = this.addWindow(TEXTURE.POKEDEX_WINDOW, -375, +110, this.windowWeightAndHeightWidth, this.windowWeightAndHeightHeight, 16, 16, 16, 16).setScale(this.scale);
    const heightTitle = this.addText(-415, +95, i18next.t('menu:pokedex_height'), TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5);
    const weightTitle = this.addText(-415, +125, i18next.t('menu:pokedex_weight'), TEXTSTYLE.MESSAGE_BLACK).setOrigin(0.5, 0.5);
    heightTitle.setScale(0.35);
    weightTitle.setScale(0.35);

    this.type1 = this.addImage(TEXTURE.BLANK, -435, +48).setScale(1.2);
    this.type2 = this.addImage(TEXTURE.BLANK, -350, +48).setScale(1.2);

    this.container.add(this.pokemonFront);

    this.container.add(windowDesc);
    this.container.add(this.pokemonDesc);
    this.container.add(windowName);
    this.container.add(windowWeightAndHeight);
    this.container.add(this.pokemonHeight);
    this.container.add(this.pokemonWeight);
    this.container.add(heightTitle);
    this.container.add(weightTitle);
    this.container.add(this.type1);
    this.container.add(this.type2);
    this.container.add(this.pokemonName);
    this.container.add(this.pokemonSpecies);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.container.setScrollFactor(0);
  }

  show(data?: string): void {
    this.container.setVisible(true);
  }

  protected onClean(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data: string): void {
    const pokedex = this.pokedexs[data as unknown as number];

    this.pokemonFront.setTexture(getPokemonTextureFromPokedex('front', Pokedex.matchGen(pokedex) ? pokedex : null, null));

    if (Pokedex.matchGen(pokedex)) {
      const data = getPokemonData(pokedex);
      this.updateTypeSummary(getPokemonType(data!.type1)!, getPokemonType(data?.type2 ?? null)!);
      this.updateWeightAndHeightSummary(data!.height_m, data!.weight_kg);
      this.updateDescSummary(i18next.t(`pokemon:${pokedex}.description`));
      this.updateNameSummaryAndSpecies(pokedex);
    } else {
      this.type1.setTexture(TEXTURE.BLANK);
      this.type2.setTexture(TEXTURE.BLANK);
      this.pokemonHeight.setText('');
      this.pokemonWeight.setText('');
      this.pokemonDesc.setText('');
      this.pokemonName.setText('');
      this.pokemonSpecies.setText('');
    }
  }

  update(time?: number, delta?: number): void {}

  updatePokedexs(pokedexs: string[]) {
    this.pokedexs = pokedexs;
  }

  private updateTypeSummary(type_1: TYPE, type_2: TYPE): void {
    type_1 ? this.type1.setTexture(TEXTURE.TYPES, `types-${type_1}`) : this.type1.setTexture(TEXTURE.BLANK);
    type_2 ? this.type2.setTexture(TEXTURE.TYPES, `types-${type_2}`) : this.type2.setTexture(TEXTURE.BLANK);
  }

  private updateWeightAndHeightSummary(height: string, weight: string): void {
    this.pokemonHeight.setText(height + ' ' + SYMBOL_HEIGHT);
    this.pokemonWeight.setText(weight + ' ' + SYMBOL_WEIGHT);
  }

  private updateDescSummary(desc: string): void {
    this.pokemonDesc.setText(desc);
  }

  private updateNameSummaryAndSpecies(pokedex: string) {
    let name = '';
    let species = '';

    if (pokedex.includes('hisui') || pokedex.includes('paldea') || pokedex.includes('alola') || pokedex.includes('galar') || pokedex.includes('west') || pokedex.includes('east')) {
      let split = pokedex.split('_');
      pokedex = split[0];
      name = i18next.t(`menu:${split[1]}`) + ' ' + i18next.t(`pokemon:${split[0]}.name`);
      species = i18next.t(`pokemon:${split[1]}.species`);
    } else {
      name = i18next.t(`pokemon:${pokedex}.name`);
      species = i18next.t(`pokemon:${pokedex}.species`);
    }

    this.pokemonName.setText(name);
    this.pokemonSpecies.setText(species);
  }
}
