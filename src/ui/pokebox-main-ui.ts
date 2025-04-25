import i18next from 'i18next';
import { AUDIO } from '../enums/audio';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { MAX_POKEBOXBG_SLOT, PlayerInfo, PokeBoxBG } from '../storage/player-info';
import { PokeboxUi } from './pokebox-ui';
import { addImage, addText, addWindow, playSound, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { Box, MAX_BOX_BG, MyPokemon } from '../storage/box';
import { PokemonGender } from '../object/pokemon-object';

export class PokeboxMainUi extends Ui {
  private mode: OverworldMode;
  private pokeboxUi: PokeboxUi;

  private container!: Phaser.GameObjects.Container;
  private menuContainer!: Phaser.GameObjects.Container;
  private pokeIconContainer!: Phaser.GameObjects.Container;
  private boxMenuContainer!: Phaser.GameObjects.Container;
  private boxBgListContainer!: Phaser.GameObjects.Container;
  private boxListContainer!: Phaser.GameObjects.Container;

  private box!: Phaser.GameObjects.Image;
  private boxTitle!: Phaser.GameObjects.Text;
  private boxArrowLeft!: Phaser.GameObjects.Image;
  private boxArrowRight!: Phaser.GameObjects.Image;
  private boxTitleDummy!: Phaser.GameObjects.Image;
  private window!: Phaser.GameObjects.NineSlice;
  private icons: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];
  private shinyIcons: Phaser.GameObjects.Image[] = [];
  private backgrounds: PokeBoxBG[] = [];
  private boxMenuWindows: Phaser.GameObjects.Image[] = [];
  private boxBgTexts: string[] = [];
  private boxBgWindows: Phaser.GameObjects.Image[] = [];
  private boxList: string[] = [];
  private boxListWindows: Phaser.GameObjects.Image[] = [];
  private menuWindows: Phaser.GameObjects.Image[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];

  private lastRow!: number | null;
  private lastCol!: number | null;
  private lastBoxSelect!: number;
  private bgMenuStart!: number;

  private readonly finger: TEXTURE = TEXTURE.FINGER;
  private readonly MaxRow: number = 9;
  private readonly MaxColumn: number = 7;
  private readonly MaxBoxIndex: number = 32;
  private readonly BoxMenuInfo: string[] = [i18next.t('menu:boxJump'), i18next.t('menu:boxBackground'), i18next.t('menu:cancel')];
  private readonly menu: string[] = [i18next.t('menu:addParty'), i18next.t('menu:boxJump'), i18next.t('menu:cancel')];
  private readonly BOXBG_PER_LIST = 5;

  constructor(scene: InGameScene, mode: OverworldMode, pokeboxUi: PokeboxUi) {
    super(scene);
    this.mode = mode;
    this.pokeboxUi = pokeboxUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.lastBoxSelect = 0;
    this.lastRow = 0;
    this.lastCol = 0;

    this.container = this.scene.add.container(width / 2 - 265, height / 2 + 20);
    this.pokeIconContainer = this.scene.add.container(width / 2 - 685, height / 2 - 215);

    this.setupBoxMenu(width, height);
    this.setupBoxBgList(width, height);
    this.setupBoxList(width, height);
    this.setupMenu(width, height);

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

    this.boxMenuContainer.setVisible(false);
    this.boxMenuContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.boxMenuContainer.setScrollFactor(0);

    this.boxBgListContainer.setVisible(false);
    this.boxBgListContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.boxBgListContainer.setScrollFactor(0);

    this.boxListContainer.setVisible(false);
    this.boxListContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.boxListContainer.setScrollFactor(0);

    this.menuContainer.setVisible(false);
    this.menuContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.menuContainer.setScrollFactor(0);
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
    const keyboardManager = KeyboardManager.getInstance();

    let row = this.lastRow ? this.lastRow : 0;
    let col = this.lastCol ? this.lastCol : 0;

    let choice = row * this.MaxRow + col;

    this.dummys[choice].setTexture(this.finger);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevChoice = choice;
      try {
        switch (key) {
          case KEY.UP:
            if (row > -1) row--;
            if (row === -1) {
              playSound(this.scene, AUDIO.OVERWORD_MENU_SELECT);

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
              playSound(this.scene, AUDIO.OVERWORD_MENU_SELECT);

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
              playSound(this.scene, AUDIO.BAG_SELECT);
              this.handleMenuKeyInput(pokemon, choice);
            }
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.POKEBOX_CLOSE);
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.pokeboxUi.clean();
            this.mode.popUiStack();
            this.cleanPage();
            return;
        }

        choice = row * this.MaxRow + col;

        if (choice !== prevChoice) {
          playSound(this.scene, AUDIO.OVERWORD_MENU_SELECT);

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

  handleMenuKeyInput(pokemon: MyPokemon, idx: number) {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    this.menuContainer.setVisible(true);

    let start = 0;
    let end = 2;
    let choice = start;
    let hasParty = this.hasPartySlot(pokemon);

    hasParty ? this.menuTexts[0].setText(i18next.t('menu:removeParty')) : this.menuTexts[0].setText(i18next.t('menu:addParty'));

    this.menuWindows[choice].setTexture(TEXTURE.CHOICE_S);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            choice = Math.max(start, choice - 1);
            break;
          case KEY.DOWN:
            choice = Math.min(end, choice + 1);
            break;
          case KEY.SELECT:
            if (choice === 0) {
              playSound(this.scene, AUDIO.BAG_SELECT);

              if (hasParty) {
                this.pokeboxUi.getPokeboxPartyUi().removeParty(pokemon);
                this.updateHasPartyUi(idx!, false);
              } else {
                this.pokeboxUi.getPokeboxPartyUi().addParty(pokemon) ? this.updateHasPartyUi(idx!, true) : await this.showFullPartyMessage();
              }
              this.mode.updatePartySlotUi();
              this.cleanMenu(choice);
              this.handleKeyInput();
            } else if (choice === 1) {
              playSound(this.scene, AUDIO.BAG_SELECT);

              //move to box.
              this.cleanMenu(choice);
              this.bgMenuStart = 0;
              this.renderBoxList();
              this.handleBoxListKeyInput('pokemon', pokemon);
            } else {
              playSound(this.scene, AUDIO.BAG_CLOSE);

              this.cleanMenu(choice);
              this.handleKeyInput();
            }
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);
            this.cleanMenu(choice);
            this.handleKeyInput();
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (choice !== prevChoice) {
        playSound(this.scene, AUDIO.BAG_DECISON);

        this.menuWindows[prevChoice].setTexture(TEXTURE.CHOICE);
        this.menuWindows[choice].setTexture(TEXTURE.CHOICE_S);
      }
    });
  }

  handleBoxSelectKeyInput() {
    const keys = [KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT];
    const keyboardManager = KeyboardManager.getInstance();

    let page = this.lastBoxSelect ? this.lastBoxSelect : 0;

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      const prevPage = page;

      try {
        switch (key) {
          case KEY.DOWN:
            playSound(this.scene, AUDIO.OVERWORD_MENU_SELECT);

            this.lastBoxSelect = page;
            this.boxTitleDummy.setTexture(TEXTURE.BLANK);
            this.restoreBoxArrow(false);
            this.handleKeyInput();
            this.pokeboxUi.updatePokemonInfoUi(this.lastRow! * this.MaxRow + this.lastCol!);
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.BAG_SELECT);

            this.lastBoxSelect = page;
            this.boxMenuContainer.setVisible(true);
            this.handleBoxMenuKeyInput();
            break;
          case KEY.LEFT:
            page = (page - 1 + this.MaxBoxIndex + 1) % (this.MaxBoxIndex + 1);
            break;
          case KEY.RIGHT:
            page = (page + 1) % (this.MaxBoxIndex + 1);
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (key === KEY.LEFT || key === KEY.RIGHT) {
        if (page !== prevPage) {
          playSound(this.scene, AUDIO.OVERWORD_MENU_SELECT);

          this.cleanPage();
          this.renderBackground(page);
          await this.renderPage(page);
        }
      }
    });
  }

  handleBoxMenuKeyInput() {
    const keys = [KEY.DOWN, KEY.UP, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let start = 0;
    let end = 2;
    let choice = start;

    this.boxMenuWindows[choice].setTexture(TEXTURE.CHOICE_S);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            choice = Math.max(start, choice - 1);
            break;
          case KEY.DOWN:
            choice = Math.min(end, choice + 1);
            break;
          case KEY.SELECT:
            if (choice === 0) {
              playSound(this.scene, AUDIO.BAG_SELECT);

              this.cleanBoxMenu(choice);
              this.bgMenuStart = 0;
              this.renderBoxList();
              this.handleBoxListKeyInput('box');
            } else if (choice === 1) {
              playSound(this.scene, AUDIO.BAG_SELECT);

              this.cleanBoxMenu(choice);
              this.bgMenuStart = 0;
              this.renderBoxBgList();
              this.handleBoxBgListKeyInput();
            } else {
              playSound(this.scene, AUDIO.BAG_CLOSE);

              this.cleanBoxMenu(choice);
              this.handleBoxSelectKeyInput();
            }
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);

            this.cleanBoxMenu(choice);
            this.handleBoxSelectKeyInput();
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (choice !== prevChoice) {
        playSound(this.scene, AUDIO.BAG_DECISON);

        this.boxMenuWindows[prevChoice].setTexture(TEXTURE.CHOICE);
        this.boxMenuWindows[choice].setTexture(TEXTURE.CHOICE_S);
      }
    });
  }

  handleBoxBgListKeyInput() {
    const keys = [KEY.DOWN, KEY.UP, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    this.boxBgListContainer.setVisible(true);

    let choice = 0;

    this.boxBgWindows[choice].setTexture(TEXTURE.CHOICE_S);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      let prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) choice--;
            else if (this.bgMenuStart > 0) {
              prevChoice = 1;
              this.bgMenuStart--;
              this.renderBoxBgList();
            }
            break;
          case KEY.DOWN:
            if (choice < Math.min(this.BOXBG_PER_LIST, this.boxBgTexts.length) - 1) {
              choice++;
            } else if (this.bgMenuStart + this.BOXBG_PER_LIST < this.boxBgTexts.length) {
              prevChoice = 5;
              this.bgMenuStart++;
              this.renderBoxBgList();
            }
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.BAG_SELECT);

            this.updateBackground(this.lastBoxSelect, (choice + this.bgMenuStart).toString() as PokeBoxBG);
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);

            this.boxBgListContainer.setVisible(false);
            this.bgMenuStart = 0;
            this.handleBoxSelectKeyInput();
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            playSound(this.scene, AUDIO.BAG_DECISON);

            if (this.boxBgWindows[prevChoice]) this.boxBgWindows[prevChoice].setTexture(TEXTURE.CHOICE);
            if (this.boxBgWindows[choice]) this.boxBgWindows[choice].setTexture(TEXTURE.CHOICE_S);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private handleBoxListKeyInput(target: 'box' | 'pokemon', pokemon?: MyPokemon) {
    const keys = [KEY.DOWN, KEY.UP, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    this.boxListContainer.setVisible(true);

    let choice = 0;

    this.boxListWindows[choice].setTexture(TEXTURE.CHOICE_S);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      let prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) choice--;
            else if (this.bgMenuStart > 0) {
              prevChoice = 1;
              this.bgMenuStart--;
              this.renderBoxList();
            }
            break;
          case KEY.DOWN:
            if (choice < Math.min(this.BOXBG_PER_LIST, this.boxList.length) - 1) {
              choice++;
            } else if (this.bgMenuStart + this.BOXBG_PER_LIST < this.boxList.length) {
              prevChoice = 5;
              this.bgMenuStart++;
              this.renderBoxList();
            }
            break;
          case KEY.SELECT:
            playSound(this.scene, AUDIO.BAG_SELECT);

            this.boxListContainer.setVisible(false);
            this.cleanPage();
            const fromBoxSelect = this.lastBoxSelect;
            this.lastBoxSelect = choice + this.bgMenuStart;
            if (target === 'box') {
              this.renderBackground(this.lastBoxSelect);
              await this.renderPage(this.lastBoxSelect);
              this.handleBoxSelectKeyInput();
            } else if (target === 'pokemon') {
              await this.mode.moveToPokemon({ pokedex: pokemon!.pokedex, gender: pokemon!.gender, from: fromBoxSelect, to: this.lastBoxSelect });
              this.lastBoxSelect = fromBoxSelect;
              this.showPokemonIcon();
              this.handleKeyInput();
            }
            this.bgMenuStart = 0;
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);

            this.boxListContainer.setVisible(false);
            this.bgMenuStart = 0;
            target === 'box' ? this.handleBoxSelectKeyInput() : this.handleKeyInput();
            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            playSound(this.scene, AUDIO.BAG_DECISON);

            if (this.boxListWindows[prevChoice]) this.boxListWindows[prevChoice].setTexture(TEXTURE.CHOICE);
            if (this.boxListWindows[choice]) this.boxListWindows[choice].setTexture(TEXTURE.CHOICE_S);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private renderBoxBgList() {
    const contentHeight = 45;
    const spacing = 5;

    let currentY = 0;

    this.cleanBoxBgList();

    const visibleItems = this.boxBgTexts.slice(this.bgMenuStart, this.bgMenuStart + this.BOXBG_PER_LIST);

    for (const key of visibleItems) {
      if (key) {
        const window = addImage(this.scene, TEXTURE.CHOICE, 0, currentY);
        const name = addText(this.scene, -60, currentY, i18next.t(`menu:${key}`), TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0.5);

        this.boxBgWindows.push(window);

        this.boxBgListContainer.add(window);
        this.boxBgListContainer.add(name);

        currentY += contentHeight + spacing;
      }
    }
  }

  private renderBoxList() {
    const contentHeight = 45;
    const spacing = 5;

    let currentY = 0;

    this.cleanBoxList();

    const visibleItems = this.boxList.slice(this.bgMenuStart, this.bgMenuStart + this.BOXBG_PER_LIST);

    for (const key of visibleItems) {
      if (key) {
        const window = addImage(this.scene, TEXTURE.CHOICE, 0, currentY);
        const name = addText(this.scene, -60, currentY, key, TEXTSTYLE.ITEM_TITLE).setOrigin(0, 0.5);

        this.boxListWindows.push(window);

        this.boxListContainer.add(window);
        this.boxListContainer.add(name);

        currentY += contentHeight + spacing;
      }
    }
  }

  private async renderPage(select: number) {
    await this.mode.getPokebox(select);
    this.showPokemonIcon();
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

  private setupMenu(width: number, height: number) {
    const contentHeight: number = 40;
    const spacing: number = 10;
    let currentY = 0;

    this.menuContainer = this.scene.add.container(width / 2 + 710, height / 2 + 190);

    for (const info of this.menu) {
      const window = addImage(this.scene, TEXTURE.CHOICE, 0, currentY);
      const text = addText(this.scene, -60, currentY, info, TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);

      this.menuWindows.push(window);
      this.menuTexts.push(text);

      this.menuContainer.add(window);
      this.menuContainer.add(text);

      currentY += contentHeight + spacing;
    }

    this.menuContainer.setScale(2.6);
  }

  private setupBoxMenu(width: number, height: number) {
    const contentHeight: number = 40;
    const spacing: number = 10;
    let currentY = 0;

    this.boxMenuContainer = this.scene.add.container(width / 2 + 710, height / 2 + 185);

    for (const info of this.BoxMenuInfo) {
      const window = addImage(this.scene, TEXTURE.CHOICE, 0, currentY);
      const text = addText(this.scene, -60, currentY, info, TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);

      this.boxMenuWindows.push(window);

      this.boxMenuContainer.add(window);
      this.boxMenuContainer.add(text);

      currentY += contentHeight + spacing;
    }

    this.boxMenuContainer.setScale(2.6);
  }

  private setupBoxBgList(width: number, height: number) {
    this.boxBgListContainer = this.scene.add.container(width / 2 + 715, height / 2 - 55);

    for (let idx = 0; idx <= MAX_BOX_BG; idx++) {
      this.boxBgTexts.push(i18next.t(`menu:box${idx}`));
    }

    this.boxBgListContainer.setScale(2.6);
  }

  private setupBoxList(width: number, height: number) {
    this.boxListContainer = this.scene.add.container(width / 2 + 715, height / 2 - 55);

    for (let idx = 0; idx < MAX_POKEBOXBG_SLOT; idx++) {
      this.boxList.push(i18next.t(`menu:box`) + ' ' + idx);
    }

    this.boxListContainer.setScale(2.6);
  }

  private cleanBoxBgList() {
    if (this.boxBgListContainer) {
      this.boxBgListContainer.removeAll(true);
    }

    this.boxBgWindows.forEach((window) => {
      window.destroy();
    });

    this.boxBgWindows = [];
  }

  private cleanBoxList() {
    if (this.boxListContainer) {
      this.boxListContainer.removeAll(true);
    }

    this.boxListWindows.forEach((window) => {
      window.destroy();
    });

    this.boxListWindows = [];
  }

  private cleanBoxMenu(choice: number) {
    this.boxMenuContainer.setVisible(false);
    this.boxMenuWindows[choice].setTexture(TEXTURE.CHOICE);
  }

  private cleanMenu(choice: number) {
    this.menuContainer.setVisible(false);
    this.menuWindows[choice].setTexture(TEXTURE.CHOICE);
  }

  private hasPartySlot(pokemon: MyPokemon) {
    return PlayerInfo.getInstance().hasPartySlot(pokemon);
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

  private async showFullPartyMessage() {
    await this.mode.startMessage([{ type: 'sys', format: 'talk', content: i18next.t('message:partyIsFull') }]);
  }
}
