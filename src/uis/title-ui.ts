import { AUDIO, DEPTH, EASE, KEY, MODE, TEXTSTYLE, TEXTURE } from '../enums';
import { Keyboard } from '../core/manager/keyboard-manager';
import i18next from '../i18n';
import { PlayerPokemon } from '../obj/player-pokemon';
import { InGameScene } from '../scenes/ingame-scene';
import { PlayerGender } from '../types';
import { playEffectSound, runFadeEffect, Ui } from './ui';
import { Game } from '../core/manager/game-manager';
import { PlayerGlobal } from '../core/storage/player-storage';
import { PC } from '../core/storage/pc-storage';
import { VERSION } from '../constants';
import { formatPlaytime } from '../utils/string-util';

export class TitleUi extends Ui {
  private bgContainer!: Phaser.GameObjects.Container;
  private windowContainer!: Phaser.GameObjects.Container;
  private splashContainer!: Phaser.GameObjects.Container;

  private bg!: Phaser.GameObjects.Image;
  private title!: Phaser.GameObjects.Image;
  private windows: Phaser.GameObjects.NineSlice[] = [];
  private texts: Phaser.GameObjects.Text[] = [];
  private versionText!: Phaser.GameObjects.Text;
  private splashText!: Phaser.GameObjects.Text;

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

    this.bgContainer = this.createTrackedContainer(width / 2, height / 2);
    this.splashContainer = this.createTrackedContainer(width / 2, height / 2);
    this.windowContainer = this.createTrackedContainer(width / 2, height / 2 + 160);

    this.bg = this.addBackground(TEXTURE.BG_TITLE).setOrigin(0.5, 0.5);
    this.title = this.addImage(TEXTURE.LOGO_0, 0, -410).setScale(3.2);

    const titleLeftX = this.title.x - this.title.displayWidth / 2;
    const titleRightX = this.title.x + this.title.displayWidth / 2;
    const titleTopY = this.title.y - this.title.displayHeight / 2;

    this.versionText = this.addText(titleLeftX, -330, VERSION, TEXTSTYLE.SPLASH_TEXT).setOrigin(0, 0.5);
    this.splashText = this.addText(titleRightX, titleTopY + 90, i18next.t('menu:splashText_2'), TEXTSTYLE.SPLASH_TEXT)
      .setOrigin(0.5, 0.5)
      .setRotation(Phaser.Math.DegToRad(-25));

    this.splashContainer.add(this.splashText);
    this.splashContainer.add(this.versionText);

    this.bgContainer.add(this.bg);
    this.bgContainer.add(this.title);

    this.bgContainer.setVisible(false);
    this.bgContainer.setDepth(DEPTH.TITLE - 1);
    this.bgContainer.setScrollFactor(0);

    this.splashContainer.setVisible(false);
    this.splashContainer.setDepth(DEPTH.TITLE + 2);
    this.splashContainer.setScrollFactor(0);

    this.windowContainer.setVisible(false);
    this.windowContainer.setDepth(DEPTH.TITLE);
    this.windowContainer.setScrollFactor(0);
  }

  async show(): Promise<void> {
    this.assertNotDestroyed();

    Keyboard.blockKeys(false);

    runFadeEffect(this.scene, 1000, 'in');

    this.restoreContinue();
    this.removeMenus();
    this.createMenus();

    const playerData = PlayerGlobal.getData();

    if (playerData) {
      const nickname = playerData.nickname;
      const location = playerData.location;
      const gender = playerData.gender;
      const avatar = playerData.avatar;
      const party = PC.getParty();

      this.createContinue(nickname, location, gender, avatar, party);
    }

    this.bgContainer.setVisible(true);
    this.windowContainer.setVisible(true);
    this.splashContainer.setVisible(true);

    this.startSplashAnimation();

    this.handleKeyInput();
  }

  protected onClean(): void {
    this.choice = 0;
    this.windows = [];
    this.texts = [];
    this.continueParties = [];
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {
    let choice = this.choice ? this.choice : 0;

    this.renderWindowTexture();

    Keyboard.setAllowKey([KEY.UP, KEY.DOWN, KEY.SELECT, KEY.ENTER]);
    Keyboard.setKeyDownCallback(async (key) => {
      let prevChoice = choice;

      console.log('title ui handleKeyInput');

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
          case KEY.ENTER:
          case KEY.SELECT:
            playEffectSound(this.scene, AUDIO.SELECT_0);

            const target = this.menus[choice];

            if (target === i18next.t('menu:newgame')) {
              if (!PlayerGlobal.getData()) {
                await Game.changeMode(MODE.STARTER);
              } else {
                await Game.changeMode(MODE.ACCOUNT_DELETE);
              }
            } else if (target === i18next.t('menu:logout')) {
              await Game.changeMode(MODE.LOGOUT);
            } else if (target === i18next.t('menu:continue')) {
              await Game.changeMode(MODE.SEASON_SCREEN);
            } else if (target === i18next.t('menu:option')) {
              await Game.changeMode(MODE.OPTION);
            }

            if (this.windows[choice]) this.windows[choice].setTexture(TEXTURE.WINDOW_MENU);

            this.choice = 0;
            break;
        }
        if (key === KEY.UP || key === KEY.DOWN) {
          console.log('title ui handleKeyInput up or down');
          if (choice !== prevChoice) {
            this.choice = choice;

            playEffectSound(this.scene, AUDIO.SELECT_0);

            this.windows[prevChoice].setTexture(TEXTURE.WINDOW_MENU);
            this.windows[choice].setTexture(TEXTURE.WINDOW_MENU_S);
          }
        }
      } catch (error) {
        console.error(`Error: ${error}`);
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
    const continueWindow = this.addWindow(TEXTURE.WINDOW_0, 0, -230, this.windowWidth, 95, 16, 16, 16, 16).setScale(this.scale);
    const continueTitle = this.addText(this.contentPosY, -340, i18next.t('menu:continue'), TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);
    const continueTitleName = this.addText(this.contentPosY, -290, i18next.t('menu:continueName'), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continueTitleLocation = this.addText(this.contentPosY, -245, i18next.t('menu:continueLocation'), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continueTitlePlaytime = this.addText(this.contentPosY, -200, i18next.t('menu:continuePlaytime'), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continueName = this.addText(-60, -290, nickname, TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continueLocation = this.addText(-60, -245, i18next.t(`menu:${location}`), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);
    const continuePlaytime = this.addText(-60, -200, formatPlaytime(PlayerGlobal.getData()?.updatedAt as Date, PlayerGlobal.getData()?.createdAt as Date), TEXTSTYLE.SPECIAL).setOrigin(0, 0.5);

    const statue = this.addImage(`${gender}_${avatar}_statue`, -335, -140).setScale(3.4);

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
      const icon = this.addImage(`pokemon_icon${pokemon ? pokemon.getPokedex() : '000'}${pokemon?.getShiny() ? 's' : ''}`, currentX, -140);
      const shiny = this.addImage(pokemon?.getShiny() ? TEXTURE.ICON_SHINY : TEXTURE.BLANK, currentX - 40, -160).setScale(1.4);

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
    this.windows = [];
    this.texts = [];
    this.continueParties = [];
  }

  private createMenus() {
    let currentY = 0;

    for (const target of this.menus) {
      const window = this.addWindow(TEXTURE.WINDOW_MENU, 0, currentY, this.windowWidth, 30, 16, 16, 16, 16).setScale(this.scale);
      const text = this.addText(this.contentPosY, currentY, target, TEXTSTYLE.DEFAULT_BLACK).setOrigin(0, 0.5);

      this.windows.push(window);
      this.texts.push(text);

      this.windowContainer.add(window);
      this.windowContainer.add(text);

      currentY += this.contentHeight + this.contentSpacing;
    }
  }

  private startSplashAnimation(): void {
    this.scene.tweens.killTweensOf(this.splashText);

    this.splashText.setScale(0.5);

    const tween = this.scene.tweens.add({
      targets: this.splashText,
      scaleX: 0.4,
      scaleY: 0.4,
      duration: 400,
      ease: EASE.SINE_EASEINOUT,
      yoyo: true,
      repeat: -1,
    });

    this.trackTween(tween);
  }
}
