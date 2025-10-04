import { getIngameApi } from '../api';
import { MAX_ITEM_SLOT, MAX_PARTY_SLOT } from '../constants';
import { GM } from '../core/game-manager';
import { AUDIO, DEPTH, KEY, MODE, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import i18next from '../i18n';
import { PlayerItem } from '../obj/player-item';
import { PlayerPokemon } from '../obj/player-pokemon';
import { InGameScene } from '../scenes/ingame-scene';
import { BagStorage } from '../storage';
import { GetItemRes, PlayerGender } from '../types';
import { getPokemonType } from '../utils/string-util';
import { addBackground, addImage, addText, addWindow, playSound, runFadeEffect, Ui } from './ui';

export class TitleUi extends Ui {
  private bgContainer!: Phaser.GameObjects.Container;
  private windowContainer!: Phaser.GameObjects.Container;

  private bg!: Phaser.GameObjects.Image;
  private title!: Phaser.GameObjects.Image;
  private windows: Phaser.GameObjects.NineSlice[] = [];
  private texts: Phaser.GameObjects.Text[] = [];

  private choice: number = 0;

  private continueParties: Phaser.GameObjects.Image[] = [];

  private readonly windowWidth: number = 240;
  private readonly contentPosY: number = -370;
  private readonly contentHeight: number = 100;
  private readonly contentSpacing: number = 15;
  private readonly scale: number = 3.4;
  private menus = [i18next.t('menu:newgame'), i18next.t('menu:option'), i18next.t('menu:logout')];

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.bgContainer = this.createContainer(width / 2, height / 2);
    this.windowContainer = this.createContainer(width / 2, height / 2 + 160);

    this.bg = addBackground(this.scene, TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);
    this.title = addImage(this.scene, TEXTURE.LOGO_0, 0, -370).setScale(4);

    this.bgContainer.add(this.bg);
    this.bgContainer.add(this.title);

    this.bgContainer.setVisible(false);
    this.bgContainer.setDepth(DEPTH.TITLE - 1);
    this.bgContainer.setScrollFactor(0);

    this.windowContainer.setVisible(false);
    this.windowContainer.setDepth(DEPTH.TITLE);
    this.windowContainer.setScrollFactor(0);
  }

  async show(data?: any): Promise<void> {
    runFadeEffect(this.scene, 1000, 'in');

    this.restoreContinue();
    this.removeMenus();
    this.createMenus();

    await this.getIngame();

    this.bgContainer.setVisible(true);
    this.windowContainer.setVisible(true);

    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.bgContainer.setVisible(false);
    this.windowContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();

    let choice = this.choice ? this.choice : 0;

    this.renderWindowTexture();

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback(async (key) => {
      let prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > 0) {
              choice--;
            }
            break;
          case KEY.DOWN:
            if (choice < this.windows.length - 1) {
              choice++;
            }
            break;
          case KEY.SELECT:
            const target = this.menus[choice];

            if (target === i18next.t('menu:newgame')) {
              if (!GM.getUserData()) {
                GM.changeMode(MODE.STARTER);
              } else {
                GM.changeMode(MODE.ACCOUNT_DELETE);
              }
            } else if (target === i18next.t('menu:logout')) {
              GM.changeMode(MODE.LOGOUT);
            } else if (target === i18next.t('menu:continue')) {
              if (GM.getUserData()?.isStarter) {
                GM.changeMode(MODE.BLACK_SCREEN);
              }
            } else if (target === i18next.t('menu:option')) {
              GM.changeMode(MODE.OPTION);
            }

            this.windows[choice].setTexture(TEXTURE.WINDOW_MENU);
            this.choice = 0;

            break;
        }

        if (key === KEY.UP || key === KEY.DOWN) {
          if (choice !== prevChoice) {
            this.choice = choice;

            playSound(this.scene, AUDIO.SELECT_0, GM.getUserOption()?.getEffectVolume());

            this.windows[prevChoice].setTexture(TEXTURE.WINDOW_MENU);
            this.windows[choice].setTexture(TEXTURE.WINDOW_MENU_S);
          }
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {}

  private renderWindowTexture() {
    for (const window of this.windows) {
      window.setTexture(TEXTURE.WINDOW_MENU);
    }

    this.windows[this.choice].setTexture(TEXTURE.WINDOW_MENU_S);
  }

  private createContinue(nickname: string, location: string, gender: PlayerGender, avatar: number, party: (PlayerPokemon | null)[]) {
    const continueWindow = addWindow(this.scene, TEXTURE.WINDOW_0, 0, -230, this.windowWidth, 95, 16, 16, 16, 16).setScale(this.scale);
    const continueTitle = addText(this.scene, this.contentPosY, -340, i18next.t('menu:continue'), TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);
    const continueTitleName = addText(this.scene, this.contentPosY, -290, i18next.t('menu:continueName'), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continueTitleLocation = addText(this.scene, this.contentPosY, -245, i18next.t('menu:continueLocation'), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continueTitlePlaytime = addText(this.scene, this.contentPosY, -200, i18next.t('menu:continuePlaytime'), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continueName = addText(this.scene, -60, -290, nickname, TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continueLocation = addText(this.scene, -60, -245, i18next.t(`menu:overworld_${location}`), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continuePlaytime = addText(this.scene, -60, -200, '00:00', TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);

    const statue = addImage(this.scene, `${gender}_${avatar}_statue`, -335, -140).setScale(3.4);

    this.windowContainer.add(continueWindow);
    this.windowContainer.add(continueTitle);
    this.windowContainer.add(continueTitleName);
    this.windowContainer.add(continueTitleLocation);
    this.windowContainer.add(continueTitlePlaytime);
    this.windowContainer.add(continueName);
    this.windowContainer.add(continueLocation);
    this.windowContainer.add(continuePlaytime);
    this.windowContainer.add(statue);

    const contentWidth = 80;
    const spacing = 10;
    let currentX = -200;

    party.forEach((pokemon) => {
      const icon = addImage(this.scene, `pokemon_icon${pokemon ? pokemon.getPokedex() : '000'}`, currentX, -140);
      const shiny = addImage(this.scene, TEXTURE.BLANK, currentX, -140);

      icon.setScale(1.4);
      shiny.setScale(1.4);

      this.windowContainer.add(icon);
      this.windowContainer.add(shiny);

      currentX += contentWidth + spacing;
    });

    this.windows.unshift(continueWindow);
    this.menus.unshift(i18next.t('menu:continue'));
  }

  private restoreContinue() {
    for (let i = 0; i < this.menus.length; i++) {
      if (this.menus[i] === i18next.t('menu:continue')) {
        this.windows[i].destroy();
        this.menus.splice(i, 1);
        this.windows.splice(i, 1);
        break;
      }
    }
  }

  private removeMenus() {
    if (this.windowContainer) {
      this.windowContainer.removeAll(true);
    }

    this.windows.forEach((window) => window.destroy());
    this.texts.forEach((text) => text.destroy());
    this.continueParties.forEach((image) => image.destroy());

    this.windows = [];
    this.texts = [];
    this.continueParties = [];
  }

  private createMenus() {
    let currentY = 0;

    for (const target of this.menus) {
      const window = addWindow(this.scene, TEXTURE.WINDOW_MENU, 0, currentY, this.windowWidth, 30, 16, 16, 16, 16).setScale(this.scale);
      const text = addText(this.scene, this.contentPosY, currentY, target, TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);

      this.windows.push(window);
      this.texts.push(text);

      this.windowContainer.add(window);
      this.windowContainer.add(text);

      currentY += this.contentHeight + this.contentSpacing;
    }
  }

  private async getIngame() {
    const ret = await getIngameApi();

    if (ret.result) {
      GM.initUserData(ret.data);

      const data = GM.getUserData()!;

      this.createContinue(data.nickname, data.location, data.gender, data.avatar, data.party);
    } else {
      GM.setUserData(null);
    }
  }
}
