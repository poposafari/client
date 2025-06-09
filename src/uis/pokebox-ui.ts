import i18next from 'i18next';
import { eventBus } from '../core/event-bus';
import { DEPTH } from '../enums/depth';
import { EVENT } from '../enums/event';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { PokemonGender, PokemonSkill } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addWindow, getTextShadow, getTextStyle, playSound, Ui } from './ui';
import { Box, MAX_BOX_BG, MyPokemon } from '../storage/box';
import { TYPE } from '../enums/type';
import { PokemonData } from '../data/pokemon';
import { MenuUi } from './menu-ui';
import { ListUi } from './list-ui';
import { ListForm, MaxPartySlot, PokeBoxBG } from '../types';
import { KEY } from '../enums/key';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { getPokeboxApi, movePokemonApi } from '../api';
import { PlayerInfo } from '../storage/player-info';
import { isPokedexShiny } from '../utils/string-util';
import { MODE } from '../enums/mode';
import { PlayerObject } from '../object/player-object';
import { PLAYER_STATUS } from '../enums/player-status';
import { AUDIO } from '../enums/audio';

export class PokeboxUi extends Ui {
  private pokeboxMainUi: PokeboxMainUi;
  private pokeboxInfoUi: PokeboxInfoUi;
  private pokeboxPartyUi: PokeboxPartyUi;

  private container!: Phaser.GameObjects.Container;

  private bg!: Phaser.GameObjects.Image;

  public checkHandleKey!: boolean;

  tempPlayerObject!: PlayerObject;

  constructor(scene: InGameScene) {
    super(scene);

    this.pokeboxInfoUi = new PokeboxInfoUi(this.scene);
    this.pokeboxPartyUi = new PokeboxPartyUi(this.scene, this);
    this.pokeboxMainUi = new PokeboxMainUi(this.scene, this);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.checkHandleKey = false;

    this.pokeboxMainUi.setup();
    this.pokeboxInfoUi.setup();
    this.pokeboxPartyUi.setup();

    this.container = this.scene.add.container(width / 2, height / 2);

    this.bg = addBackground(this.scene, TEXTURE.BG_BOX).setOrigin(0.5, 0.5);

    this.container.add(this.bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);
  }

  show(data?: PlayerObject): void {
    if (data) {
      this.tempPlayerObject = data;
    }

    eventBus.emit(EVENT.PLAY_SOUND, this.scene);

    this.container.setVisible(true);

    this.pokeboxMainUi.show();
    this.pokeboxInfoUi.show();
    this.pokeboxPartyUi.show();
  }

  clean(data?: any): void {
    this.container.setVisible(false);

    this.pokeboxMainUi.clean();
    this.pokeboxInfoUi.clean();
    this.pokeboxPartyUi.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {
    if (!this.checkHandleKey) return;

    this.checkHandleKey = false;

    this.pokeboxMainUi.handleKeyInput();
  }

  update(time: number, delta: number): void {}

  updatePokemonInfoUi(idx: number) {
    this.pokeboxInfoUi.updateInfo(idx);
  }

  updatePokemonTint(pokedex: string, gender: PokemonGender) {
    const idx = this.pokeboxMainUi.scanTargetPokemon(pokedex.slice(0, 4), gender);

    if (idx >= 0) this.pokeboxMainUi.updateHasPartyUi(idx, false);
  }

  getPokeboxMainUi() {
    return this.pokeboxMainUi;
  }

  getPokeboxPartyUi() {
    return this.pokeboxPartyUi;
  }
}

export class PokeboxInfoUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private skillContainer!: Phaser.GameObjects.Container;
  private skillContainerPosY!: number;

  private topInfoWindow!: Phaser.GameObjects.Image;
  private bottomInfoWindow!: Phaser.GameObjects.Image;
  private sprite!: Phaser.GameObjects.Image;
  private shiny!: Phaser.GameObjects.Image;
  private name!: Phaser.GameObjects.Text;
  private gender!: Phaser.GameObjects.Text;
  private pokedex!: Phaser.GameObjects.Text;
  private type1!: Phaser.GameObjects.Image;
  private type2!: Phaser.GameObjects.Image;
  private capturePokeball!: Phaser.GameObjects.Image;
  private captureCnt!: Phaser.GameObjects.Text;
  private captureCntIcon!: Phaser.GameObjects.Image;
  private captureCntTitle!: Phaser.GameObjects.Text;
  private captureLocation!: Phaser.GameObjects.Text;
  private captureDate!: Phaser.GameObjects.Text;
  private skillIcons: Phaser.GameObjects.Image[] = [];
  private skillTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    this.skillContainerPosY = height / 2 + 265;

    this.container = this.scene.add.container(width / 2 + 660, height / 2);
    this.skillContainer = this.scene.add.container(width / 2 + 435, this.skillContainerPosY);

    this.topInfoWindow = addImage(this.scene, TEXTURE.BOX_NAME, 0, -390).setScale(2.8);
    this.bottomInfoWindow = addImage(this.scene, TEXTURE.BOX_DESC, -10, +410).setScale(2.8);
    this.sprite = addImage(this.scene, `pokemon_sprite000`, 0, 0).setScale(5);
    this.shiny = addImage(this.scene, TEXTURE.BLANK, -255, -390).setScale(2.2);
    this.name = addText(this.scene, -240, -355, '', TEXTSTYLE.BOX_NAME).setOrigin(0, 0.5).setScale(1);
    this.gender = addText(this.scene, this.name.x + this.name.displayWidth, -350, '', TEXTSTYLE.GENDER_0)
      .setOrigin(0, 0.5)
      .setScale(0.8);
    const pokedexTitle = addText(this.scene, -230, -435, `No.`, TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5).setScale(1.2);
    this.pokedex = addText(this.scene, -160, -445, `0000`, TEXTSTYLE.BOX_POKEDEX).setOrigin(0, 0.5).setScale(1.6);
    this.type1 = addImage(this.scene, TEXTURE.TYPES, +90, -450).setScale(1.8);
    this.type2 = addImage(this.scene, TEXTURE.TYPES, +210, -450).setScale(1.8);
    this.captureCntTitle = addText(this.scene, -230, -190, i18next.t('menu:captureCount'), TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0.5, 0.5);
    this.captureCntIcon = addImage(this.scene, `item002`, -230, -250).setScale(1.4).setInteractive();
    const captureCntColon = addText(this.scene, -185, -250, ':', TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.7).setOrigin(0, 0.5);
    this.captureCnt = addText(this.scene, -155, -250, '', TEXTSTYLE.SPECIAL).setScale(0.7).setOrigin(0, 0.5);
    const captureTitle = addText(this.scene, -110, +322, i18next.t('menu:capture'), TEXTSTYLE.BOX_POKEDEX).setScale(1);
    this.captureLocation = addText(this.scene, -260, +405, '- ', TEXTSTYLE.SPECIAL).setScale(0.6).setOrigin(0, 0.5);
    this.captureDate = addText(this.scene, -260, +480, '- ' + '', TEXTSTYLE.SPECIAL)
      .setScale(0.6)
      .setOrigin(0, 0.5);

    this.container.add(this.topInfoWindow);
    this.container.add(this.bottomInfoWindow);
    this.container.add(this.sprite);
    this.container.add(this.name);
    this.container.add(this.shiny);
    this.container.add(this.gender);
    this.container.add(pokedexTitle);
    this.container.add(this.pokedex);
    this.container.add(this.type1);
    this.container.add(this.type2);
    this.container.add(captureTitle);
    this.container.add(this.captureCntIcon);
    this.container.add(this.captureCntTitle);
    this.container.add(captureCntColon);
    this.container.add(this.captureCnt);
    this.container.add(this.captureDate);
    this.container.add(this.captureLocation);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);

    this.skillContainer.setVisible(false);
    this.skillContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.skillContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.skillContainer.setVisible(true);

    this.handlePointer();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.skillContainer.setVisible(false);

    this.captureCntIcon.off('pointerover');
    this.captureCntIcon.off('pointerout');
    this.captureCntIcon.disableInteractive();

    eventBus.emit(EVENT.HUD_PARTY_UPDATE);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {}

  update(): void {}

  updateInfo(idx: number) {
    const pokemon = Box.getInstance().getMyPokemons()[idx];

    if (pokemon) {
      this.pokedex.setText(pokemon.pokedex);
      this.name.setText(i18next.t(`pokemon:${pokemon.pokedex}.name`));
      this.captureCnt.setText(pokemon.count.toString());
      this.updateGenderInfo(pokemon.gender);
      this.updateSprite(pokemon);
      this.updateTypes(pokemon.pokedex);
      this.updateShiny(pokemon.shiny);
      this.updateSkills(pokemon.skill);
      this.captureLocation.setText(`- ` + i18next.t(`menu:overworld_${pokemon.captureLocation}`));
      this.captureDate.setText(`- ` + pokemon.captureDate.toString().split('T')[0]);
    } else {
      this.pokedex.setText('0000');
      this.name.setText(``);
      this.captureCnt.setText(``);
      this.captureDate.setText(``);
      this.captureLocation.setText(``);
      this.updateGenderInfo();
      this.updateShiny(false);
      this.cleanSkills();
      this.sprite.setTexture(`pokemon_sprite000`);
      this.type1.setTexture(TEXTURE.BLANK);
      this.type2.setTexture(TEXTURE.BLANK);
    }
  }

  private updateGenderInfo(gender?: PokemonGender) {
    this.gender.setX(this.name.x + this.name.displayWidth);
    if (gender === 'female') {
      this.gender.setText(`♀`);
      this.gender.setStyle(getTextStyle(TEXTSTYLE.GENDER_1));
    } else if (gender === 'male') {
      this.gender.setText(`♂`);
      this.gender.setStyle(getTextStyle(TEXTSTYLE.GENDER_0));
    } else {
      this.gender.setText(``);
    }
  }

  private updateSprite(pokemon: MyPokemon) {
    let shiny = pokemon.shiny ? 's' : '';
    let gender = pokemon.gender === 'male' ? 'm' : pokemon.gender === 'female' ? 'f' : '';

    let texture = `pokemon_sprite${pokemon.pokedex}_${gender}${shiny}`;

    this.sprite.setTexture(texture);
  }

  private updateTypes(pokedex: string) {
    let type1: TYPE | null = TYPE.NONE;
    let type2: TYPE | null = TYPE.NONE;

    type1 = PokemonData[Number(pokedex)].type1;
    type2 = PokemonData[Number(pokedex)].type2;

    type1 ? this.type1.setTexture(TEXTURE.TYPES, `types-${type1}`) : this.type1.setTexture(TEXTURE.BLANK);
    type2 ? this.type2.setTexture(TEXTURE.TYPES, `types-${type2}`) : this.type2.setTexture(TEXTURE.BLANK);
  }

  private updateShiny(shiny: boolean) {
    if (shiny) {
      this.shiny.setTexture(TEXTURE.SHINY);
      this.name.setStyle(getTextStyle(TEXTSTYLE.SHINY));
    } else {
      this.shiny.setTexture(TEXTURE.BLANK);
      this.name.setStyle(getTextStyle(TEXTSTYLE.BOX_NAME));
    }
    this.setNameEffect(shiny);
  }

  private updateSkills(skills: PokemonSkill) {
    const contentWidth = 35;
    const spacing = 10;
    let currentY = 0;

    this.cleanSkills();

    for (const skill of skills) {
      const icon = addImage(this.scene, TEXTURE.BLANK, 0, currentY).setScale(1);
      const text = addText(this.scene, +25, currentY, i18next.t(`menu:${skill}`), TEXTSTYLE.BOX_CAPTURE_TITLE);
      text.setScale(0.5).setOrigin(0, 0.5);

      switch (skill) {
        case 'surf':
          icon.setTexture(`item032`);
          break;
        case 'darkeyes':
          icon.setTexture(`item033`);
          break;
      }

      this.skillIcons.push(icon);
      this.skillTexts.push(text);

      this.skillContainer.add(icon);
      this.skillContainer.add(text);

      currentY += currentY + contentWidth + spacing;
    }

    const length = this.skillIcons.length;
    if (length > 1) {
      this.skillContainer.setY(this.skillContainerPosY - (length - 1) * (contentWidth + spacing));
    } else {
      this.skillContainer.setY(this.skillContainerPosY);
    }
  }

  private setNameEffect(shiny: boolean) {
    let shadow;
    if (shiny) {
      shadow = getTextShadow(TEXTSTYLE.SHINY);
      this.name.setStyle(getTextStyle(TEXTSTYLE.SHINY));
    } else {
      shadow = getTextShadow(TEXTSTYLE.BOX_NAME);
      this.name.setStyle(getTextStyle(TEXTSTYLE.BOX_NAME));
    }
    this.name.setShadow(shadow[0] as number, shadow[1] as number, shadow[2] as string);
  }

  private handlePointer() {
    this.captureCntIcon.setInteractive().setScrollFactor(0);
    this.captureCntTitle.setVisible(false);

    this.captureCntIcon.on('pointerover', () => {
      this.captureCntTitle.setVisible(true);
    });

    this.captureCntIcon.on('pointerout', () => {
      this.captureCntTitle.setVisible(false);
    });
  }

  private cleanSkills() {
    this.skillIcons.forEach((icon) => {
      icon.off('pointerover');
      icon.destroy();
    });
    this.skillTexts.forEach((text) => text.destroy());

    this.skillIcons = [];
    this.skillTexts = [];

    this.skillContainer.removeAll(true);
  }
}

export class PokeboxMainUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private pokeIconContainer!: Phaser.GameObjects.Container;

  private pokeboxUi: PokeboxUi;
  private menu: MenuUi;
  private menuBox: MenuUi;
  private boxList: ListUi;
  private boxBgList: ListUi;

  private lastRow!: number | null;
  private lastCol!: number | null;
  private lastBoxSelect!: number;
  private bgMenuStart!: number;

  //box background
  private box!: Phaser.GameObjects.Image;

  //box title
  private window!: Phaser.GameObjects.NineSlice;
  private boxTitle!: Phaser.GameObjects.Text;
  private boxArrowLeft!: Phaser.GameObjects.Image;
  private boxArrowRight!: Phaser.GameObjects.Image;
  private boxTitleDummy!: Phaser.GameObjects.Image;

  //box main
  private icons: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private shinyIcons: Phaser.GameObjects.Image[] = [];

  //data
  private backgrounds: PokeBoxBG[] = [];

  private readonly finger: TEXTURE = TEXTURE.FINGER;
  private readonly MaxRow: number = 9;
  private readonly MaxColumn: number = 7;
  private readonly MaxBoxIndex: number = 32;

  constructor(scene: InGameScene, pokeboxUi: PokeboxUi) {
    super(scene);
    this.pokeboxUi = pokeboxUi;

    this.menu = new MenuUi(scene);
    this.menuBox = new MenuUi(scene);
    this.boxList = new ListUi(scene);
    this.boxBgList = new ListUi(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.lastBoxSelect = 0;
    this.lastRow = 0;
    this.lastCol = 0;

    this.container = this.scene.add.container(width / 2 - 265, height / 2 + 20);
    this.pokeIconContainer = this.scene.add.container(width / 2 - 685, height / 2 - 215);

    this.menu.setup([i18next.t('menu:addParty'), i18next.t('menu:boxJump'), i18next.t('menu:evolve'), i18next.t('menu:rename'), i18next.t('menu:cancel')]);
    this.menuBox.setup([i18next.t('menu:boxJump'), i18next.t('menu:boxBackground'), i18next.t('menu:rename'), i18next.t('menu:cancel')]);
    this.boxList.setupInfo(250, +445, +525, this.createBoxListForm(), 10, 278);
    this.boxBgList.setupInfo(250, +445, +525, this.createBoxBgListForm(), 10, 278);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_5, 0, 0, 402, 402, 16, 16, 16, 16).setScale(2.4);
    this.box = addImage(this.scene, `box0`, 0, 0).setDisplaySize(940, 940);
    this.boxTitle = addText(this.scene, -50, -400, '', TEXTSTYLE.BOX_NAME).setScale(0.8).setOrigin(0, 0.5);
    this.boxTitleDummy = addImage(this.scene, TEXTURE.BLANK, +10, -380).setScale(3);
    this.boxArrowLeft = addImage(this.scene, TEXTURE.ARROW_BOX, -405, -405).setDisplaySize(100, 100);
    this.boxArrowRight = addImage(this.scene, TEXTURE.ARROW_BOX, +405, -405).setDisplaySize(100, 100).setFlipX(true);

    this.restoreBoxArrow(false);

    this.container.add(this.window);
    this.container.add(this.box);
    this.container.add(this.boxTitle);
    this.container.add(this.boxTitleDummy);
    this.container.add(this.boxArrowLeft);
    this.container.add(this.boxArrowRight);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);

    this.pokeIconContainer.setVisible(false);
    this.pokeIconContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.pokeIconContainer.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    this.container.setVisible(true);
    this.pokeIconContainer.setVisible(true);

    this.setBackgrounds();
    this.renderBackground(this.lastBoxSelect);

    await this.renderPage(this.lastBoxSelect);

    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pokeIconContainer.setVisible(false);

    this.cleanPage();
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  handleKeyInput() {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT, KEY.CANCEL];
    const keyboard = KeyboardHandler.getInstance();

    let row = this.lastRow ? this.lastRow : 0;
    let col = this.lastCol ? this.lastCol : 0;

    let choice = row * this.MaxRow + col;

    this.dummys[choice].setTexture(this.finger);

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback((key) => {
      const prevChoice = choice;

      eventBus.emit(EVENT.PLAY_SOUND, this.scene, key);

      try {
        switch (key) {
          case KEY.UP:
            if (row > -1) row--;
            if (row === -1) {
              this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.boxTitleDummy.setTexture(TEXTURE.FINGER);
              this.restoreBoxArrow(true);
              this.handleBoxSelectKeyInput();
              return;
            }
            break;
          case KEY.DOWN:
            if (row < this.MaxColumn - 1) row++;
            break;
          case KEY.LEFT:
            if (col > -1) col--;
            if (col === -1) {
              this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
              this.pokeboxUi.getPokeboxPartyUi().handleKeyInput();
              return;
            }
            break;
          case KEY.RIGHT:
            if (col < this.MaxRow - 1) col++;
            break;
          case KEY.SELECT:
            const pokemon = Box.getInstance().getMyPokemons()[choice];
            if (pokemon) {
              this.handleMenuKeyInput(pokemon, choice);
            }
            break;
          case KEY.CANCEL:
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.pokeboxUi.clean();
            eventBus.emit(EVENT.POP_MODE);
            return;
        }

        choice = row * this.MaxRow + col;

        if (choice !== prevChoice) {
          this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.dummys[choice].setTexture(this.finger);

          this.pokeboxUi.updatePokemonInfoUi(choice);

          this.lastRow = row;
          this.lastCol = col;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  async handleMenuKeyInput(pokemon: MyPokemon, idx: number) {
    let hasParty = this.hasPartySlot(pokemon);

    if (hasParty) {
      this.menu.updateInfo(i18next.t('menu:addParty'), i18next.t('menu:removeParty'));
    } else {
      this.menu.updateInfo(i18next.t('menu:removeParty'), i18next.t('menu:addParty'));
    }

    this.menu.show();
    const ret = await this.menu.handleKeyInput();

    if (ret === i18next.t('menu:addParty')) {
      this.pokeboxUi.getPokeboxPartyUi().addParty(pokemon) ? this.updateHasPartyUi(idx!, true) : this.showFullPartyMessage();
    } else if (ret === i18next.t('menu:removeParty')) {
      this.pokeboxUi.getPokeboxPartyUi().removeParty(pokemon);
      this.updateHasPartyUi(idx!, false);
    } else if (ret === i18next.t('menu:boxJump')) {
      this.handleBoxListKeyInput('pokemon', pokemon);
      return;
    } else if (ret === i18next.t('menu:evolve')) {
      console.log(ret);
    } else if (ret === i18next.t('menu:rename')) {
      console.log(ret);
    }

    this.menu.clean();
    this.handleKeyInput();
  }

  handleBoxSelectKeyInput() {
    const keys = [KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();

    let page = this.lastBoxSelect ? this.lastBoxSelect : 0;

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback(async (key) => {
      const prevPage = page;

      eventBus.emit(EVENT.PLAY_SOUND, this.scene, key);

      try {
        switch (key) {
          case KEY.DOWN:
            this.lastBoxSelect = page;
            this.boxTitleDummy.setTexture(TEXTURE.BLANK);
            this.restoreBoxArrow(false);
            this.handleKeyInput();
            this.pokeboxUi.updatePokemonInfoUi(this.lastRow! * this.MaxRow + this.lastCol!);
            break;
          case KEY.SELECT:
            this.lastBoxSelect = page;
            this.handleBoxMenuKeyInput();
            break;
          case KEY.LEFT:
            page = (page - 1 + this.MaxBoxIndex + 1) % (this.MaxBoxIndex + 1);
            break;
          case KEY.RIGHT:
            page = (page + 1) % (this.MaxBoxIndex + 1);
            break;
        }

        if (key === KEY.LEFT || key === KEY.RIGHT) {
          if (page !== prevPage) {
            this.cleanPage();
            this.renderBackground(page);
            await this.renderPage(page);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  async handleBoxMenuKeyInput() {
    this.menuBox.show();
    const ret = await this.menuBox.handleKeyInput();

    if (ret === i18next.t('menu:boxJump')) {
      this.handleBoxListKeyInput('box');
      return;
    } else if (ret === i18next.t('menu:boxBackground')) {
      this.handleBoxBgListKeyInput();
      return;
    } else if (ret === i18next.t('menu:rename')) {
    }

    this.handleBoxSelectKeyInput();
  }

  async handleBoxBgListKeyInput() {
    const ret = await this.boxBgList.handleKeyInput();

    if (ret !== i18next.t('menu:cancelMenu')) {
      this.updateBackground(this.lastBoxSelect, ret as PokeBoxBG);
    }
    this.handleBoxSelectKeyInput();
  }

  private async handleBoxListKeyInput(target: 'box' | 'pokemon', pokemon?: MyPokemon) {
    const ret = await this.boxList.handleKeyInput();

    if (target === 'pokemon' && ret !== i18next.t('menu:cancelMenu')) {
      if (ret === this.lastBoxSelect) {
        this.handleKeyInput();
        return;
      }

      const result = await movePokemonApi({ pokedex: pokemon!.pokedex, gender: pokemon!.gender, from: this.lastBoxSelect, to: ret as number });
      if (result && result.data) {
        this.cleanPage();
        Box.getInstance().setup(result.data.data);
        this.showPokemonIcon();
      } else {
        this.pokeboxUi.checkHandleKey = true;
      }
    } else if (target === 'box' && ret !== i18next.t('menu:cancelMenu')) {
      if (ret === this.lastBoxSelect) {
        this.handleBoxSelectKeyInput();
        return;
      }

      this.lastBoxSelect = ret as number;
      this.cleanPage();
      this.renderBackground(this.lastBoxSelect);
      await this.renderPage(this.lastBoxSelect);
    }

    if (target === 'pokemon') {
      this.handleKeyInput();
    }

    if (target === 'box') {
      this.handleBoxSelectKeyInput();
    }
  }

  private async renderPage(select: number) {
    const result = await getPokeboxApi({ box: select });

    if (result && result.data) {
      Box.getInstance().setup(result.data as any);
      this.showPokemonIcon();
    }
  }

  private showPokemonIcon() {
    const contentHeight = 90;
    const spacing = 15;

    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i < this.MaxColumn; i++) {
      for (let j = 0; j < this.MaxRow; j++) {
        const icon = addImage(this.scene, TEXTURE.BLANK, currentX, currentY);
        const dummy = addImage(this.scene, TEXTURE.BLANK, currentX + 20, currentY + 50);
        const shiny = addImage(this.scene, TEXTURE.BLANK, currentX - 50, currentY - 30).setScale(2);

        icon.setScale(2.4);
        dummy.setScale(3);

        this.icons.push(icon);
        this.dummys.push(dummy);
        this.shinyIcons.push(shiny);

        this.pokeIconContainer.add(icon);
        this.pokeIconContainer.add(dummy);
        this.pokeIconContainer.add(shiny);

        currentX += contentHeight + spacing;
      }
      currentX = 0;
      currentY += contentHeight + spacing;
    }

    const pokemons = Box.getInstance().getMyPokemons();

    for (let i = 0; i < pokemons.length; i++) {
      const target = pokemons[i];
      this.icons[i].setTexture(`pokemon_icon${target.pokedex}${target.shiny ? 's' : ''}`);

      if (this.hasPartySlot(pokemons[i])) this.updateHasPartyUi(i, true);
      if (target.shiny) this.shinyIcons[i].setTexture(TEXTURE.SHINY);
      else this.shinyIcons[i].setTexture(TEXTURE.BLANK);
    }
  }

  private cleanPage() {
    this.icons.forEach((icon) => icon.destroy());
    this.dummys.forEach((dummy) => dummy.destroy());
    this.shinyIcons.forEach((icon) => icon.destroy());

    this.pokeIconContainer.removeAll(true);

    this.icons = [];
    this.dummys = [];
    this.shinyIcons = [];
  }

  private setBackgrounds() {
    this.backgrounds = [];
    this.backgrounds = PlayerInfo.getInstance().getPokeboxBg();
  }

  private renderBackground(index: number) {
    this.box.setTexture(`box${this.backgrounds[index]}`);
    this.boxTitle.setText(i18next.t(`menu:box`) + index.toString());
  }

  private updateBackground(index: number, value: PokeBoxBG) {
    this.backgrounds[index] = value;
    this.box.setTexture(`box${this.backgrounds[index]}`);

    PlayerInfo.getInstance().setPokeboxBg(this.backgrounds);
  }

  private restoreBoxArrow(onoff: boolean) {
    let tint = onoff ? -1 : 0x6a6a6a;

    if (tint < 0) {
      this.boxArrowLeft.clearTint();
      this.boxArrowRight.clearTint();
      return;
    }

    this.boxArrowLeft.setTint(tint);
    this.boxArrowRight.setTint(tint);
  }

  updateHasPartyUi(idx: number, onoff: boolean) {
    this.icons[idx].setAlpha(onoff ? 0.5 : 1);
  }

  scanTargetPokemon(pokedex: string, gender: PokemonGender) {
    const pokemons = Box.getInstance().getMyPokemons();

    for (let i = 0; i < pokemons.length; i++) {
      const target = pokemons[i];

      if (target.pokedex === pokedex && target.gender === gender) return i;
    }

    return -1;
  }

  hasPartySlot(pokemon: MyPokemon) {
    return PlayerInfo.getInstance().hasPartySlot(pokemon);
  }

  private createBoxListForm() {
    const ret: ListForm[] = [];

    for (let i = 0; i <= this.MaxBoxIndex; i++) {
      ret.push({ name: i18next.t(`menu:box`) + i, nameImg: '', etc: '', etcImg: '' });
    }

    return ret;
  }

  private createBoxBgListForm() {
    const ret: ListForm[] = [];

    for (let i = 0; i <= MAX_BOX_BG; i++) {
      ret.push({ name: i18next.t(`menu:box${i}`), nameImg: '', etc: '', etcImg: '' });
    }

    return ret;
  }

  private showFullPartyMessage() {
    this.pokeboxUi.checkHandleKey = true;
    eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [{ type: 'sys', format: 'talk', content: i18next.t('message:warn_full_party'), speed: 10 }]);
  }
}

export class PokeboxPartyUi extends Ui {
  private pokeboxUi: PokeboxUi;
  private menu: MenuUi;

  private container!: Phaser.GameObjects.Container;
  private iconContainer!: Phaser.GameObjects.Container;

  private petIcon!: Phaser.GameObjects.Image;
  private shinyIconPet!: Phaser.GameObjects.Image;
  private partyIcons: Phaser.GameObjects.Image[] = [];
  private partyDummys: Phaser.GameObjects.Image[] = [];
  private shinyIcons: Phaser.GameObjects.Image[] = [];
  private menuWindows: Phaser.GameObjects.Image[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];

  private lastStart!: number;

  constructor(scene: InGameScene, pokeboxUi: PokeboxUi) {
    super(scene);
    this.pokeboxUi = pokeboxUi;
    this.menu = new MenuUi(scene);

    eventBus.on(EVENT.BACKTO_POKEBOX_PARTYUI, () => {
      this.handleKeyInput();
    });
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const contentHeight = 55;

    this.setupIcon(width, height, contentHeight);
    this.menu.setup([i18next.t('menu:removeParty'), i18next.t('menu:follow'), i18next.t('menu:cancel')]);

    this.container = this.scene.add.container(width / 2 - 850, height / 2 + 160);

    const petWindow = addWindow(this.scene, TEXTURE.WINDOW_7, 0, -192, contentHeight, contentHeight, 16, 16, 16, 16);
    const partyWindow = addWindow(this.scene, TEXTURE.WINDOW_7, 0, -32, contentHeight, 42 * MaxPartySlot, 16, 16, 16, 16);

    this.container.add(petWindow);
    this.container.add(partyWindow);

    this.container.setScale(2.6);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);

    this.iconContainer.setVisible(false);
    this.iconContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.iconContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.iconContainer.setVisible(true);

    this.lastStart = 0;
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.iconContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  async handleKeyInput() {
    const keys = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();

    let start = this.lastStart ? this.lastStart : 0;
    let end = MaxPartySlot - 1;
    let choice = start;

    this.partyDummys[choice].setTexture(TEXTURE.ARROW_W_R);

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice <= MaxPartySlot - 1 && choice >= 1) choice--;
            break;
          case KEY.DOWN:
            if (choice < end && choice < MaxPartySlot - 1) {
              choice++;
            }
            break;
          case KEY.RIGHT:
            this.lastStart = 0;
            this.partyDummys[choice].setTexture(TEXTURE.BLANK);
            this.pokeboxUi.getPokeboxMainUi().handleKeyInput();
            break;
          case KEY.SELECT:
            const target = PlayerInfo.getInstance().getPartySlot()[choice];

            let hasPet = this.hasPet(target);

            if (hasPet) {
              this.menu.updateInfo(i18next.t('menu:follow'), i18next.t('menu:removeFollow'));
            } else {
              this.menu.updateInfo(i18next.t('menu:removeFollow'), i18next.t('menu:follow'));
            }

            if (target) {
              this.handleMenuKeyInput(target);
              return;
            }
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (choice !== prevChoice) {
        playSound(this.scene, AUDIO.SELECT_0);

        this.partyDummys[prevChoice].setTexture(TEXTURE.BLANK);
        this.partyDummys[choice].setTexture(TEXTURE.ARROW_W_R);

        this.lastStart = choice;
      }
    });
  }

  async handleMenuKeyInput(target: string) {
    this.menu.show();
    const ret = await this.menu.handleKeyInput();
    let hasPet = this.hasPet(target);

    if (ret === i18next.t('menu:removeParty')) {
      if (hasPet) PlayerInfo.getInstance().setPet(null);
      if (this.pokeboxUi.tempPlayerObject.getStatus() === PLAYER_STATUS.SURF) {
        if (PlayerInfo.getInstance().getSurfPokemon() === target) {
          eventBus.emit(EVENT.OVERLAP_MODE, MODE.MESSAGE, [{ type: 'default', format: 'talk', content: i18next.t(`message:warn_surf`), speed: 10, end: EVENT.BACKTO_POKEBOX_PARTYUI }]);
          return;
        }
      }

      this.updatePetIcon();

      const [pokedex, gender] = target.split('_');
      this.removeParty(null, this.lastStart);
      this.pokeboxUi.updatePokemonTint(pokedex, gender as PokemonGender);
      this.handleKeyInput();
    } else if (ret === i18next.t('menu:follow')) {
      this.setPet(target);
    } else if (ret === i18next.t('menu:removeFollow')) {
      PlayerInfo.getInstance().setPet(null);
      this.updatePetIcon();
    }

    this.handleKeyInput();
  }

  addParty(pokemon: MyPokemon) {
    if (pokemon && PlayerInfo.getInstance().addPartySlot(pokemon)) {
      this.updateParty();
      return true;
    }

    return false;
  }

  removeParty(pokemon: MyPokemon | null, idx?: number) {
    if (!pokemon && idx !== undefined && idx >= 0) {
      PlayerInfo.getInstance().removePartSlot(null, idx);
    } else {
      PlayerInfo.getInstance().removePartSlot(pokemon!);
    }

    this.updateParty();
  }

  private updateParty() {
    const party = PlayerInfo.getInstance().getPartySlot();
    for (let i = 0; i < MaxPartySlot; i++) {
      this.shinyIcons[i].setTexture(TEXTURE.BLANK);
      if (party[i]) {
        const key = party[i]?.split('_')[0];
        this.partyIcons[i].setTexture(`pokemon_icon${key}`);
        if (isPokedexShiny(key!)) this.shinyIcons[i].setTexture(TEXTURE.SHINY);
      } else {
        this.partyIcons[i].setTexture(`pokemon_icon000`);
      }
    }
  }

  private updatePetIcon() {
    const pet = PlayerInfo.getInstance().getPet();

    this.shinyIconPet.setTexture(TEXTURE.BLANK);

    if (pet) {
      const key = pet.split('_')[0];
      this.petIcon.setTexture(`pokemon_icon${key}`);
      if (isPokedexShiny(key!)) this.shinyIconPet.setTexture(TEXTURE.SHINY);
    } else {
      this.petIcon.setTexture(`pokemon_icon000`);
    }
  }

  private setupIcon(width: number, height: number, contentHeight: number) {
    const spacing = 10;
    let currentY = 0;

    this.iconContainer = this.scene.add.container(width / 2 - 850, height / 2 + 50);

    const petTitle = addText(this.scene, 0, -330, i18next.t('menu:followPokemon'), TEXTSTYLE.INPUT_GUIDE_WHITE);
    this.petIcon = addImage(this.scene, `pokemon_icon000`, 0, -260);
    this.shinyIconPet = addImage(this.scene, TEXTURE.BLANK, -25, -280).setScale(1.1);

    for (let i = 0; i < MaxPartySlot; i++) {
      const icon = addImage(this.scene, `pokemon_icon000`, 0, currentY - 152);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -45, currentY - 143).setScale(2);
      const shiny = addImage(this.scene, TEXTURE.BLANK, -25, currentY - 170).setScale(1.1);

      this.partyIcons.push(icon);
      this.partyDummys.push(dummy);
      this.shinyIcons.push(shiny);

      this.iconContainer.add(icon);
      this.iconContainer.add(dummy);
      this.iconContainer.add(shiny);

      currentY += contentHeight + spacing;
    }

    this.iconContainer.add(petTitle);
    this.iconContainer.add(this.petIcon);
    this.iconContainer.add(this.shinyIconPet);
    this.iconContainer.setScale(1.5);
  }

  private hasPet(target: string | null) {
    return PlayerInfo.getInstance().getPet() === target;
  }

  private setPet(pet: string | null) {
    PlayerInfo.getInstance().setPet(pet);
    this.updatePetIcon();
  }
}
